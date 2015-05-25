# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

import sublime, sublime_plugin
import os, sys, subprocess, codecs, re, webbrowser
from threading import Timer

try:
  import commands
except ImportError:
  pass

REGEXP_OUTPUT = re.compile("^[\s\S]*?line\s*(\d*)(?:\,\s*col\s*(\d*))?\:([\s\S]*)")
REGEXP_FILENAME = re.compile("^(.*)/([^/]*)$")
REGEXP_FILENAME_WIN = re.compile("^(.*)\\\([^\\\]*)$")

PLUGIN_FOLDER = os.path.dirname(os.path.realpath(__file__))
# print(PLUGIN_FOLDER)
# RC_FILE = ".fecs_helperrc"
SETTINGS_FILE = "fecsHelper.sublime-settings"
KEYMAP_FILE = "Default ($PLATFORM).sublime-keymap"
OUTPUT_VALID = b"\nfecs  INFO"

class fecsHelperCommand(sublime_plugin.TextCommand):
  def run(self, edit, show_regions=True, show_panel=True):

    # Get the current text in the buffer and save it in a temporary file.
    # This allows for scratch buffers and dirty files to be linted as well.
    temp_file_path = self.save_buffer_to_temp_file()
    output = self.run_script_on_file(temp_file_path)
    os.remove(temp_file_path)

    # Dump any diagnostics and get the output after the identification marker.
    # if PluginUtils.get_pref('print_diagnostics'):
    #   print(self.get_output_diagnostics(output))
    # output = self.get_output_data(output)

    # We're done with linting, rebuild the regions shown in the current view.
    fecsHelperGlobalStore.reset()
    fecsHelperEventListeners.reset()
    self.view.erase_regions("fecs_helper_errors")

    regions = []
    menuitems = []

    # For each line of fecs_helper output (errors, warnings etc.) add a region
    # in the view and a menuitem in a quick panel.
    lines = output.decode('utf-8').split('\n')
    for line in lines:
      print(line)
      if line.find('INFO') != -1 or line.find("OK") != -1:
        # print("continue")
        continue
      try:
        m = REGEXP_OUTPUT.match(line)

        if(m):
            line_no, column_no, description = m.group(1,2,3)
            if not column_no:
              column_no = "0"
            description = description.strip()
        else:
          continue
      except:
        continue

      symbol_name = re.match("('[^']+')", description)
      hint_point = self.view.text_point(int(line_no) - 1, int(column_no) - 1)
      if symbol_name:
        hint_region = self.view.word(hint_point)
      else:
        hint_region = self.view.line(hint_point)

      regions.append(hint_region)
      menuitems.append(line_no + ":" + column_no + " " + description)
      fecsHelperGlobalStore.errors.append((hint_region, description))

    if show_regions:
      self.add_regions(regions)
    if show_panel:
      self.view.window().show_quick_panel(menuitems, self.on_quick_panel_selection)

  def file_unsupported(self):
    file_path = self.view.file_name()
    view_settings = self.view.settings()
    has_js_or_html_extension = file_path != None and bool(re.search(r'\.(jsm?|html?)$', file_path))
    has_js_or_html_syntax = bool(re.search(r'JavaScript|HTML', view_settings.get("syntax"), re.I))
    has_json_syntax = bool(re.search("JSON", view_settings.get("syntax"), re.I))
    return has_json_syntax or (not has_js_or_html_extension and not has_js_or_html_syntax)

  def save_buffer_to_temp_file(self):
    buffer_text = self.view.substr(sublime.Region(0, self.view.size()))
    temp_file_name = ".__temp__"
    temp_file_path = PLUGIN_FOLDER + "/" + temp_file_name
    f = codecs.open(temp_file_path, mode="w", encoding="utf-8")
    f.write(buffer_text)
    f.close()
    return temp_file_path

  def run_script_on_file(self, temp_file_path):
    try:
      node_path = PluginUtils.get_node_path()
      script_path = PLUGIN_FOLDER + "/script/run.js"
      file_path = self.view.file_name()
      cmd = [node_path, script_path, temp_file_path, file_path or "?"]
      output = PluginUtils.get_output(cmd)
      # Make sure the correct/expected output is retrieved.
      # if output.find(OUTPUT_VALID) != -1:
      if output:
        return output
      msg = "Command " + '" "'.join(cmd) + " created invalid output."
      raise Exception(msg)

    except:
      # Something bad happened.
      print("Unexpected error({0}): {1}".format(sys.exc_info()[0], sys.exc_info()[1]))

      # Usually, it's just node.js not being found. Try to alleviate the issue.
      # msg = "Node.js was not found in the default path. Please specify the location."
      # if not sublime.ok_cancel_dialog(msg):
      #   msg = "You won't be able to use this plugin without specifying the path to node.js."
      #   sublime.error_message(msg)
      # else:
      #   PluginUtils.open_sublime_settings(self.view.window())

  def get_output_diagnostics(self, output):
    index = output.find(OUTPUT_VALID)
    return output[:index].decode("utf-8")

  def get_output_data(self, output):
    index = output.find(OUTPUT_VALID)
    return output[index + len(OUTPUT_VALID) + 1:].decode("utf-8")

  def add_regions(self, regions):
    package_name = (PLUGIN_FOLDER.split(os.path.sep))[-1]

    if int(sublime.version()) >= 3000:
      icon = "Packages/" + package_name + "/warning.png"
      self.view.add_regions("fecs_helper_errors", regions, "keyword", icon,
        sublime.DRAW_EMPTY |
        sublime.DRAW_NO_FILL |
        sublime.DRAW_NO_OUTLINE |
        sublime.DRAW_SQUIGGLY_UNDERLINE)
    else:
      icon = ".." + os.path.sep + package_name + os.path.sep + "warning"
      self.view.add_regions("fecs_helper_errors", regions, "keyword", icon,
        sublime.DRAW_EMPTY |
        sublime.DRAW_OUTLINED)

  def on_quick_panel_selection(self, index):
    if index == -1:
      return

    # Focus the user requested region from the quick panel.
    region = fecsHelperGlobalStore.errors[index][0]
    region_cursor = sublime.Region(region.begin(), region.begin())
    selection = self.view.sel()
    selection.clear()
    selection.add(region_cursor)
    self.view.show(region_cursor)

    if not PluginUtils.get_pref("highlight_selected_regions"):
      return

    self.view.erase_regions("fecs_helper_selected")
    self.view.add_regions("fecs_helper_selected", [region], "meta")

# fecs format
class fecsFormatCommand(sublime_plugin.TextCommand):
  def run(self, edit):
    # 这里忽略了文件类型检查，全部交给fecs format处理
    temp_file_path = self.save_buffer_to_temp_file()
    if not temp_file_path:
      return
    # print(temp_file_path)
    
    output = self.run_script_on_file(temp_file_path)
    if output:
      self.write_temp_to_file(temp_file_path, edit)
    os.remove(temp_file_path)
    self.view.set_viewport_position((0, 0), False)
    self.view.set_viewport_position(self.view.viewport_position(), False)

  # 如过无报错，将缓存区文件写入源文件
  # 否则不做操作
  def write_temp_to_file(self, temp_file_path, edit):
    f = codecs.open(temp_file_path, mode="r", encoding="utf-8")
    content = f.read()
    self.view.replace(edit, sublime.Region(0, self.view.size()), content)


  def save_buffer_to_temp_file(self):
    buffer_text = self.view.substr(sublime.Region(0, self.view.size()))
    path_dic = self.parse_file_path(self.view.file_name())
    if not path_dic:
      return
    slash = "/" if sublime.platform() != 'windows' else "\\"
    temp_file_pre_path = PLUGIN_FOLDER + slash + "formatTemp" + slash
    if not os.path.exists(temp_file_pre_path):
      os.makedirs(temp_file_pre_path)
    temp_file_path = temp_file_pre_path + path_dic['name']
    f = codecs.open(temp_file_path, mode="w", encoding="utf-8")
    f.write(buffer_text)
    f.close()
    return temp_file_path

  # return (path, filename)
  def parse_file_path(self, path):
    matchs = REGEXP_FILENAME.match(path) if sublime.platform() != "windows" else REGEXP_FILENAME_WIN.match(path)
    if matchs :
      file_path, file_name = matchs.group(1, 2)
      return {
        'path': file_path,
        'name': file_name
      }
    else:
      print('Can\'t parse path : ' , path)
      return False

  def run_script_on_file(self, temp_file_path):
    try:
      node_path = PluginUtils.get_node_path()
      script_path = PLUGIN_FOLDER + "/script/run.js"
      # file_path = self.view.file_name()
      # file_
      path_dic = self.parse_file_path(temp_file_path)
      if not path_dic:
        return
      cmd = [node_path, script_path, 'format', temp_file_path, '-o', './'   or "?"]
      output = PluginUtils.get_output(cmd)
      # Make sure the correct/expected output is retrieved.
      if output.find(b'fecs:') != -1:
        return output
      else:
        return False
      msg = "Command " + '" "'.join(cmd) + " created invalid output."
      raise Exception(msg)

    except:
      # Something bad happened.
      print("Unexpected error({0}): {1}".format(sys.exc_info()[0], sys.exc_info()[1]))

      # Usually, it's just node.js not being found. Try to alleviate the issue.
      # msg = "Node.js was not found in the default path. Please specify the location."
      # if not sublime.ok_cancel_dialog(msg):
      #   msg = "You won't be able to use this plugin without specifying the path to node.js."
      #   sublime.error_message(msg)
      # else:
      #   PluginUtils.open_sublime_settings(self.view.window())

  def get_output_diagnostics(self, output):
    index = output.find(OUTPUT_VALID)
    return output[:index].decode("utf-8")

  def get_output_data(self, output):
    index = output.find(OUTPUT_VALID)
    return output[index + len(OUTPUT_VALID) + 1:].decode("utf-8")

class fecsHelperGlobalStore:
  errors = []

  @classmethod
  def reset(self):
    self.errors = []

class fecsHelperEventListeners(sublime_plugin.EventListener):
  timer = None

  @classmethod
  def reset(self):
    # Invalidate any previously set timer.
    if self.timer != None:
      self.timer.cancel()
      self.timer = None

  @classmethod
  def on_modified(self, view):
    # Continue only if the plugin settings allow this to happen.
    # This is only available in Sublime 3.
    if int(sublime.version()) < 3000:
      return
    if not PluginUtils.get_pref("lint_on_edit"):
      return

    # Re-run the fecs_helper command after a second of inactivity after the view
    # has been modified, to avoid regions getting out of sync with the actual
    # previously linted source code.
    self.reset()

    timeout = PluginUtils.get_pref("lint_on_edit_timeout")
    self.timer = Timer(timeout, lambda: view.window().run_command("fecs_helper", { "show_panel": False }))
    self.timer.start()

  @staticmethod
  def on_post_save(view):
    # Continue only if the current plugin settings allow this to happen.
    if PluginUtils.get_pref("lint_on_save"):
      view.window().run_command("fecs_helper", { "show_panel": False })

  @staticmethod
  def on_load(view):
    # Continue only if the current plugin settings allow this to happen.
    if PluginUtils.get_pref("lint_on_load"):
      v = view.window() if int(sublime.version()) < 3000 else view
      v.run_command("fecs_helper", { "show_panel": False })

  @staticmethod
  def on_selection_modified(view):
    caret_region = view.sel()[0]

    for message_region, message_text in fecsHelperGlobalStore.errors:
      if message_region.intersects(caret_region):
        sublime.status_message(message_text)
        return
    else:
      sublime.status_message("")

class fecsHelperSetLintingPrefsCommand(sublime_plugin.TextCommand):
  def run(self, edit):
    PluginUtils.open_config_rc(self.view.window())

class fecsHelperSetPluginOptionsCommand(sublime_plugin.TextCommand):
  def run(self, edit):
    PluginUtils.open_sublime_settings(self.view.window())

class fecsHelperSetKeyboardShortcutsCommand(sublime_plugin.TextCommand):
  def run(self, edit):
    PluginUtils.open_sublime_keymap(self.view.window(), {
      "windows": "Windows",
      "linux": "Linux",
      "osx": "OSX"
    }.get(sublime.platform()))

class fecsHelperSetNodePathCommand(sublime_plugin.TextCommand):
  def run(self, edit):
    PluginUtils.open_sublime_settings(self.view.window())

class fecsHelperClearAnnotationsCommand(sublime_plugin.TextCommand):
  def run(self, edit):
    fecsHelperEventListeners.reset()
    self.view.erase_regions("fecs_helper_errors")
    self.view.erase_regions("fecs_helper_selected")

class PluginUtils:
  @staticmethod
  def get_pref(key):
    return sublime.load_settings(SETTINGS_FILE).get(key)

  @staticmethod
  def open_config_rc(window):
    window.open_file(PLUGIN_FOLDER + "/" + RC_FILE)

  @staticmethod
  def open_sublime_settings(window):
    window.open_file(PLUGIN_FOLDER + "/" + SETTINGS_FILE)

  @staticmethod
  def open_sublime_keymap(window, platform):
    window.open_file(PLUGIN_FOLDER + "/" + KEYMAP_FILE.replace("$PLATFORM", platform))

  @staticmethod
  def exists_in_path(cmd):
    # Can't search the path if a directory is specified.
    assert not os.path.dirname(cmd)
    path = os.environ.get("PATH", "").split(os.pathsep)
    extensions = os.environ.get("PATHEXT", "").split(os.pathsep)

    # For each directory in PATH, check if it contains the specified binary.
    for directory in path:
      base = os.path.join(directory, cmd)
      options = [base] + [(base + ext) for ext in extensions]
      for filename in options:
        if os.path.exists(filename):
          return True

    return False

  @staticmethod
  def get_node_path():
    platform = sublime.platform()
    node = PluginUtils.get_pref("node_path").get(platform)
    print("Using node.js path on '" + platform + "': " + node)
    return node

  @staticmethod
  def get_output(cmd):
    if int(sublime.version()) < 3000:
      if sublime.platform() != "windows":
        # Handle Linux and OS X in Python 2.
        run = '"' + '" "'.join(cmd) + '"'
        return commands.getoutput(run)
      else:
        # Handle Windows in Python 2.
        # Prevent console window from showing.
        startupinfo = subprocess.STARTUPINFO()
        startupinfo.dwFlags |= subprocess.STARTF_USESHOWWINDOW
        return subprocess.Popen(cmd, \
          stdout=subprocess.PIPE, \
          startupinfo=startupinfo).communicate()[0]
    else:
      # Handle all OS in Python 3.
      run = '"' + '" "'.join(cmd) + '"'
      # print(run)
      return subprocess.check_output(run, stderr=subprocess.STDOUT, shell=True, env=os.environ)