_actionDialog[uniId] = esui.create('ActionDialog', {
    id: args.id,title: args.title,url: args.url,actionOptions: util.mix(args.actionOptions || {}, {
        dialogId: uniId
    }),width: args.width || 400,draggable: 0,closeOnHide: 1,mask: 1,needFoot: 0
});
