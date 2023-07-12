function uploaderImg(addInput, reset = false, edit = false) {
  let addButton = $(addInput)
    .parent(".uploader_files")
    .find(".uploader_files_item");
  let imgList = $(addInput)
    .parent(".uploader_files")
    .find(".uploader_files_list");
  $(addButton).on("click", function () {
    $(addInput).trigger("click");
  });
  var maxFileSize = 5 * 1024 * 1024; // (байт) Максимальный размер файла (2мб)
  var queue = {};
  var imagesList = $(imgList);
  var itemPreviewTemplate = imagesList.find(".item").detach();
  var filelist = imagesList.children().length;
  // Вычисление лимита
  function limitUpload() {
    if (filelist > 0 || edit) {
      return 5 - filelist;
    } else if (filelist == 0 || !edit) {
      return 5 - imagesList.children().length;
    }
  }
  // Отображение лимита
  function limitDisplay() {
    let sTxt;
    switch (limitUpload()) {
      case 5:
        sTxt =
          '<span class="text">Прикрепить ' + limitUpload() + " файлов</span>";
        break;
      case 0:
        sTxt = "Достигнут лимит";
        break;
      default:
        sTxt = "можно добавить ещё " + limitUpload();
    }
    $(addButton).html(sTxt);
  }

  function limitSize() {
    $(addInput).on("change", function () {
      var total = 0;
      for (var i = 0; i < this.files.length; i++) {
        total = total + this.files[i].size;
      }
      return total;
    });
  }
  limitSize();
  $(addInput).on("change", function () {
    var files = this.files;
    var fileTypeArr = [
      "jpeg",
      "jpg",
      "png",
      "pdf",
      "doc",
      "docx",
      "xls",
      "xlsx",
      "zip",
      "rar",
    ];
    // Перебор файлов до лимита
    for (var i = 0; i < limitUpload(); i++) {
      let file = files[i];
      let fileType = "";
      if (file !== undefined) {
        fileType = file.name.split(".").pop();
        if ($.inArray(fileType, fileTypeArr) < 0) {
          $(".errormassege").text("");
          $(".errormassege").append(
            "Файлы должны быть в формате jpg, jpeg, png, zip, doc, docx, xls, xlsx, pdf"
          );
          continue;
        }
        if (file.size > maxFileSize) {
          $(".errormassege").append("Размер файла не должен превышать 2 Мб");
          continue;
        }
        $(".errormassege").html("");
        preview(file, fileType);
      }
    }
    this.value = "";
  });

  function preview(file, fileType) {
    var reader = new FileReader();
    reader.addEventListener("load", function (event) {
      if (fileType == "jpeg" || fileType == "jpg" || fileType == "png") {
        var img = document.createElement("img");
        var itemPreview = itemPreviewTemplate.clone();
        itemPreview.find(".img-wrap img").attr("src", event.target.result);
        itemPreview.data("id", file.name);
        imagesList.append(itemPreview);
      } else {
        var itemPreview = itemPreviewTemplate.clone();
        $(itemPreview).find(".img-wrap").remove();
        let icon = "fa-file";
        switch (fileType) {
          case "xls":
            icon = "fa-file-excel-o";
            break;
          case "xlsx":
            icon = "fa-file-excel-o";
            break;
          case "rar":
            icon = "fa-file-archive-o";
            break;
          case "zip":
            icon = "fa-file-archive-o";
            break;
          case "docx":
            icon = "fa-file-word-o";
            break;
          case "doc":
            icon = "fa-file-word-o";
            break;
          case "pdf":
            icon = "fa-file-pdf-o";
            break;
          default:
            icon = "fa-file";
            break;
        }
        itemPreview.find(".icon-wrap i").addClass(icon);
        itemPreview.data("id", file.name);
        imagesList.append(itemPreview);
      }
      // Обработчик удаления
      itemPreview.on("click", function () {
        delete queue[file.name];
        $(this).remove();
        limitDisplay();
      });
      queue[file.name] = file;
      // Отображение лимита при добавлении
      limitDisplay();
    });
    reader.readAsDataURL(file);
  }
  // Очистить все файлы
  function resetFiles() {
    $(addInput)[0].value = "";
    limitDisplay();
  }
  if (reset) {
    resetFiles();
  }
  // Отображение лимита при запуске
  limitDisplay();
  return queue;
}

class Uploader {
  constructor(uploader,title,  maxFileCount , uploaderMessage, fileSize, filesSize, fileIconColor, showImgPreview, fileExt) {
    this.uploader = uploader;
    this.maxFileCount = maxFileCount;
    this.Message
    this.uploaderMessage = uploaderMessage;
    this.fileSize = fileSize;
    this.filesSize = filesSize;
    this.fileIconColor = fileIconColor ? fileIconColor : '#1e3050';
    this.title = title;
    this.fileExt = fileExt;
    this.showImgPreview = showImgPreview
    this.files = [];
  }
  get Message() {
    return this._Message;
  }

  set Message(val) {
    this._Message = val;
    this._onPropertyChanged('uploaderMessage', val);
  }

  _onPropertyChanged(propName, val) {
      this.uploaderMessage.innerHTML = val
  }
  formatBytes = (bytes, decimals = 2)=> {
    if (!+bytes) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
  }
  init() {
    const uploader = document.querySelector(".uploader");
    const uploaderId = `uploader_${Date.now()}`
    const fileViewList = `<div class="uploader_text uploader_triger">
                            <h3 class="uploader_text_title">${uploader.dataset.title}</h3>
                            <span class="uploader_message"></span>
                            <span>${uploader.dataset.fileExt}</span>
                          </div>
                          <input type="file" class="uploader_input" name="files[]" multiple>
                          <ul class="uploader_list"></ul>
                          `;
    uploader.setAttribute("id", uploaderId);
    uploader.innerHTML = fileViewList;
    this.uploader = document.getElementById(uploaderId);
    this.uploaderMessage = this.uploader.querySelector('.uploader_message')
    this.fileSize = uploader.dataset.fileSize;
    this.filesSize = uploader.dataset.filesSize;
    this.maxFileCount = parseInt(uploader.dataset.maxFileCount);
    this.showImgPreview = (/true/i).test(uploader.dataset.showImgPreview)
    this.fileIconColor = uploader.dataset.fileIconColor ? uploader.dataset.fileIconColor : '#1e3050'
    this.title = uploader.dataset.title;
    this.fileExt = uploader.dataset.fileExt;
    this.limitDisplay();
    ["dragenter", "dragover", "dragleave", "drop"].forEach((eventName) => {
      uploader.addEventListener(eventName, preventDefaults, false);
    });
    function preventDefaults(e) {
      e.preventDefault();
      e.stopPropagation();
    }
    ["dragenter", "dragover"].forEach((eventName) => {
      uploader.addEventListener(eventName, highlight, false);
    });
    ["dragleave", "drop"].forEach((eventName) => {
      uploader.addEventListener(eventName, unhighlight, false);
    });
    uploader.addEventListener("drop", (e) => {
      let dt = e.dataTransfer;
      let files = dt.files;
      this.handleFiles(files);
    });
    uploader.querySelector('.uploader_triger').addEventListener("click", ()=>{
      uploader.querySelector(".uploader_input").click()
    });
    uploader
      .querySelector(".uploader_input")
      .addEventListener("change", (e) => {
        let files = e.target.files;
        this.handleFiles(files);
        e.target.value = null
      });
    function highlight(e) {
      uploader.classList.add("highlight");
    }
    function unhighlight(e) {
      uploader.classList.remove("highlight");
    }
    
  }
  handleFiles(files) {
    [...files].forEach(this.addFile);
  }
  limitUpload = ()=> {
    if (this.files.length > 0) {
      return this.maxFileCount - this.files.length;
    }else if (this.files.length == 0 ) {
      return this.maxFileCount - this.files.length
    }
  }
  limitDisplay = ()=> {
    let sTxt;
    switch (this.limitUpload()) {
      case this.maxFileCount:
        sTxt = 'Можете прикрепить ' + this.limitUpload() + " файлов";
        break;
      case 0:
        sTxt = "Достигнут лимит";
        break;
      default:
        sTxt = "можно добавить ещё " + this.limitUpload();
    }
    this.Message = sTxt
  }
  addFile = async (file) => {
    if(!this.validateExt(file).valid) {
      this.Message = `Формат файла (${this.validateExt(file).ext}) не поддерживается`
      return
    }
    let validFilesSize = await this.validFilesSize(file)
    if(!validFilesSize.valid){
      this.Message = `Размер всех файлов (${validFilesSize.filesSize}) превышатет допустимый объем (${this.maxFilesSize})`
      return
    }
    if(!this.validFileSize(file).valid){
      this.Message = `Размер файла (${this.validFileSize(this.files).fileSize}) превышатет допустимый размер (${this.maxFileSize})`
      return
    }
    let index = this.files.findIndex(f=> f.name == file.name || f.size == file.size)
    if(this.validFileCount()) return

    if(index == -1){
      let id = Date.now()
      this.files.push({id,file})
      this.limitDisplay()
      this.view(file, id)
    }else if(index >= 0){
      this.Message = `Такой файл (${file.name}) уже прикреплен`;
    }
  };
  validFileCount = ()=>{
    if(this.files.length == this.maxFileCount){
      return true
    }else{
      return false
    }
  }
  validFileSize = (f)=>{
    let maxFileSize
    let k = 1024
    let int = parseInt(this.fileSize.replace(/[^\d]/g, ''))
    if(this.fileSize.toLowerCase().includes('bites')){
      maxFileSize = Math.floor(int)
    }else if(this.fileSize.toLowerCase().includes('kb')){
      maxFileSize = Math.floor(int * k)
    }else if(this.fileSize.toLowerCase().includes('mb')){
      maxFileSize = Math.floor(int * k * k)
    }else if(this.fileSize.toLowerCase().includes('gb')){
      maxFileSize = Math.floor(int * k * k * k)
    }else if(this.fileSize.toLowerCase().includes('tb')){
      maxFileSize = Math.floor(int * k * k * k * k)
    }else if(this.fileSize.toLowerCase().includes('pb')){
      maxFileSize = Math.floor(int * k * k * k * k * k)
    }else if(this.fileSize.toLowerCase().includes('eb')){
      maxFileSize = Math.floor(int * k * k * k * k * k * k)
    }
    return {valid:f.size <= maxFileSize, fileSize: this.formatBytes(f.size), maxFileSize}
  }
  validFilesSize = async(file)=>{
    let filesSize = await this.calcAllFilesSize(this.files)
    let maxFilesSize
    let k = 1024
    let int = parseInt(this.filesSize.replace(/[^\d]/g, ''))
    if(this.filesSize.toLowerCase().includes('bites')){
      maxFilesSize = Math.floor(int)
    }else if(this.filesSize.toLowerCase().includes('kb')){
      maxFilesSize = Math.floor(int * k)
    }else if(this.filesSize.toLowerCase().includes('mb')){
      maxFilesSize = Math.floor(int * k * k)
    }else if(this.filesSize.toLowerCase().includes('gb')){
      maxFilesSize = Math.floor(int * k * k * k)
    }else if(this.filesSize.toLowerCase().includes('tb')){
      maxFilesSize = Math.floor(int * k * k * k * k)
    }else if(this.filesSize.toLowerCase().includes('pb')){
      maxFilesSize = Math.floor(int * k * k * k * k * k)
    }else if(this.filesSize.toLowerCase().includes('eb')){
      maxFilesSize = Math.floor(int * k * k * k * k * k * k)
    }
    if(filesSize){
      return {valid:(filesSize + file.size) <= maxFilesSize, filesSize: this.formatBytes(filesSize), maxFilesSize}
    }else{
      return {valid: file.size <= maxFilesSize, filesSize: this.formatBytes(file.size), maxFilesSize}
    }
  }
  calcAllFilesSize = async (files)=>{
    let size = 0
    if(!files.length > 0) return size
    for await (const num of files) {
      size += num.size
    }
    return size
  }
  validateExt = (f)=>{
    let ext = f.name.split('.').pop()
    if(this.fileExt != ''){
      return {valid: this.fileExt.includes(ext), ext}
    }else{
      return {valid: true, ext}
    }
  }
  view = (file, id) => {
    let uploaderList = this.uploader.querySelector('.uploader_list')
    let ext = file.name.split('.').pop()
    let name = file.name.split(`.${ext}`)[0]
    let icon = this.getIcon(ext)
    let mediaExtArr = ['jpeg', 'jpg', 'gif', 'png']
    console.log(name);
    const that = this 
    if(this.showImgPreview){
      if(mediaExtArr.includes(ext.toLowerCase())){
        let reader = new FileReader();
 
        reader.addEventListener("load", (event)=> {
          uploaderList.innerHTML += `<li data-id="${id}" class="uploader_list_item">
          <span class="uploader_list_item_icon"><img src="${event.target.result}"/></span>
                                      <span class="uploader_list_item_name">${name}</span>
                                      <span class="uploader_list_item_size">${this.formatBytes(file.size)}</span>
                                    </li>`
        })
        reader.readAsDataURL(file);
      }else{
        uploaderList.innerHTML += `<li data-id="${id}" class="uploader_list_item">
                                    <span class="uploader_list_item_icon">${icon}</span>
                                    <span class="uploader_list_item_name">${name}</span>
                                    <span class="uploader_list_item_size">${this.formatBytes(file.size)}</span>
                                 </li>`
      }
    }else{
      uploaderList.innerHTML += `<li data-id="${id}" class="uploader_list_item">
                                    <span class="uploader_list_item_icon">${icon}</span>
                                    <span class="uploader_list_item_name"><input type="text" name="file_name" value="${name}" disabled/><svg class="uploader_list_item_name_check" xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 448 512"><!--! Font Awesome Free 6.4.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><style>svg{fill: ${this.fileIconColor}}</style><path d="M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z"/></svg></span>
                                    <span class="uploader_list_item_size">${this.formatBytes(file.size)}</span>
                                    <span class="uploader_list_item_action">
                                      <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 128 512"><!--! Font Awesome Free 6.4.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><style>svg{fill: ${this.fileIconColor}}</style><path d="M64 360a56 56 0 1 0 0 112 56 56 0 1 0 0-112zm0-160a56 56 0 1 0 0 112 56 56 0 1 0 0-112zM120 96A56 56 0 1 0 8 96a56 56 0 1 0 112 0z"/></svg>
                                      <ul class="uploader_list_item_action_list">
                                          <li class="uploader_list_item_action_list_item delete"><svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 448 512"><!--! Font Awesome Free 6.4.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><style>svg{fill: ${this.fileIconColor}}</style><path d="M135.2 17.7C140.6 6.8 151.7 0 163.8 0H284.2c12.1 0 23.2 6.8 28.6 17.7L320 32h96c17.7 0 32 14.3 32 32s-14.3 32-32 32H32C14.3 96 0 81.7 0 64S14.3 32 32 32h96l7.2-14.3zM32 128H416V448c0 35.3-28.7 64-64 64H96c-35.3 0-64-28.7-64-64V128zm96 64c-8.8 0-16 7.2-16 16V432c0 8.8 7.2 16 16 16s16-7.2 16-16V208c0-8.8-7.2-16-16-16zm96 0c-8.8 0-16 7.2-16 16V432c0 8.8 7.2 16 16 16s16-7.2 16-16V208c0-8.8-7.2-16-16-16zm96 0c-8.8 0-16 7.2-16 16V432c0 8.8 7.2 16 16 16s16-7.2 16-16V208c0-8.8-7.2-16-16-16z"/></svg>Удалить</li>
                                          <li class="uploader_list_item_action_list_item edit"><svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512"><!--! Font Awesome Free 6.4.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><style>svg{fill: ${this.fileIconColor}}</style><path d="M362.7 19.3L314.3 67.7 444.3 197.7l48.4-48.4c25-25 25-65.5 0-90.5L453.3 19.3c-25-25-65.5-25-90.5 0zm-71 71L58.6 323.5c-10.4 10.4-18 23.3-22.2 37.4L1 481.2C-1.5 489.7 .8 498.8 7 505s15.3 8.5 23.7 6.1l120.3-35.4c14.1-4.2 27-11.8 37.4-22.2L421.7 220.3 291.7 90.3z"/></svg>Изменить</li>
                                        </ul>
                                    </span>
                                 </li>`
    }
      let items = uploaderList.querySelectorAll('.uploader_list_item')

      items.forEach(item=>{
        
        item.querySelector('.uploader_list_item_action').addEventListener('click', function (){
          console.log('click');
            let actionList = item.querySelector('.uploader_list_item_action_list')
            // this.positionMenu(e, actionList)
            if(!actionList?.classList.contains('active')){
              document.querySelectorAll('.uploader_list_item_action_list').forEach(el=>el.classList.remove('active'))
              actionList?.classList.add('active')
              let deleteItem = actionList.querySelector('.uploader_list_item_action_list_item.delete')
              let editItem = actionList.querySelector('.uploader_list_item_action_list_item.edit')
              editItem.addEventListener('click', ()=>{
                actionList.classList.remove('active')
                let item = editItem.closest('.uploader_list_item')
                let name = item.querySelector('.uploader_list_item_name')
                let input = name.querySelector('input')
                let check = name.querySelector('.uploader_list_item_name_check')
                let oldValue = input.value
                let index = that.files.findIndex(f=>f.id == item.dataset.id)
                input.disabled = false
                input.addEventListener('input', ()=>{
                  let newValue = input.value
                  if(oldValue != newValue){
                    name.classList.add('active')
                  }else{
                    name.classList.remove('active')
                  }
                })
                check.addEventListener('click', ()=>{
                  let newName = input.value
                  Object.defineProperty(that.files[index].file, 'name', {
                    writable: true,
                    value: `${newName}.${ext}`
                  });
                  input.value = newName
                  input.disabled = true
                  name.classList.remove('active')
                  console.log(that.files[index].file);
                  check.removeEventListener('click', (e)=>{})
                })
                editItem.removeEventListener('click', (e)=>{})
              })
              deleteItem.addEventListener('click', ()=>{
                let removeItem = deleteItem.closest('.uploader_list_item')
                that.files = that.files.filter(f=>f.id != removeItem.dataset.id)
                removeItem.remove()
                that.limitDisplay()
                actionList.classList.remove('active')
                console.log(that.files)
                deleteItem.removeEventListener('click', (e)=>{})
              })
            }else{
              actionList?.classList.remove('active')
            }
            item.querySelector('.uploader_list_item_action').removeEventListener('click', (e)=>{})
        })

      })

  };
  getPosition = (e)=> {
    let posx = 0;
    let posy = 0;

    if (!e) var e = document.event;
    if (e.pageX || e.pageY) {
      posx = e.pageX;
      posy = e.pageY;
    } else if (e.clientX || e.clientY) {
      posx = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
      posy = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
    }

    return {
      x: posx,
      y: posy
    }
  }
  positionMenu = (e, menu)=> {
    clickCoords = this.getPosition(e);
    clickCoordsX = clickCoords.x;
    clickCoordsY = clickCoords.y;

    menuWidth = menu.offsetWidth + 4;
    menuHeight = menu.offsetHeight + 4;

    windowWidth = window.innerWidth;
    windowHeight = window.innerHeight;

    if ( (windowWidth - clickCoordsX) < menuWidth ) {
      menu.style.left = windowWidth - menuWidth + "px";
    } else {
      menu.style.left = clickCoordsX + "px";
    }

    if ( (windowHeight - clickCoordsY) < menuHeight ) {
      menu.style.top = windowHeight - menuHeight + "px";
    } else {
      menu.style.top = clickCoordsY + "px";
    }
  }

  getIcon = (ext)=>{
    let icon
    switch (ext.toLowerCase()) {
      // code files
      case 'abc':
      case 'acd':
      case 'addin':
      case 'ads':
      case 'agi':
      case 'aia':
      case 'aidl':
      case 'alb':
      case 'aml':
      case 'ane':
      case 'apa':
      case 'apks':
      case 'appx':
      case 'appxbundle':
      case 'appxupload':
      case 'aps':
      case 'arsc':
      case 'as':
      case 'as2proj':
      case 'as3proj':
      case 'asc':
      case 'asi':
      case 'asm':
      case 'asvf':
      case 'au3':
      case 'awk':
      case 'c':
      case 'cd':
      case 'class':
      case 'cmake':
      case 'config':
      case 'cpp':
      case 'cs':
      case 'csproj':
      case 'cxx':
      case 'dart':
      case 'diff':
      case 'egg':
      case 'erb':
      case 'ex':
      case 'g4':
      case 'go':
      case 'groovy':
      case 'h':
      case 'haml':
      case 'hh':
      case 'hs':
      case 'hta':
      case 'ici':
      case 'in':
      case 'inc':
      case 'ipr':
      case 'jar':
      case 'java':
      case 'jrxml':
      case 'jsp':
      case 'jspf':
      case 'kt':
      case 'lgo':
      case 'lua':
      case 'm':
      case 'make':
      case 'mel':
      case 'mf':
      case 'ml':
      case 'mm':
      case 'mrc':
      case 'msix':
      case 'nupkg':
      case 'nut':
      case 'pas':
      case 'pdb':
      case 'pde':
      case 'php':
      case 'pl':
      case 'py':
      case 'pyd':
      case 'pyi':
      case 'pym':
      case 'pyw':
      case 'pyx':
      case 'r':
      case 'rbxl':
      case 'rbxm':
      case 'res':
      case 'rs':
      case 'rst':
      case 'scala':
      case 'scm':
      case 'script':
      case 'sh':
      case 'sln':
      case 'swift':
      case 'tcl':
      case 'toml':
      case 'ts':
      case 'unity':
      case 'vb':
      case 'vbproj':
      case 'vbs':
      case 'vcxproj':
      case 'xsd':
      case 'yaml':
      case 'yml':
      case 'ypr':
      case 'js':
      case 'jsx':
      case 'sass':
      case 'scss':
      case 'less':
      case 'css':
      case 'xml':
      case 'html':
      case 'json':
        icon = `<svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 384 512"><!--! Font Awesome Free 6.4.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><style>svg{fill: ${this.fileIconColor}}</style><path d="M64 0C28.7 0 0 28.7 0 64V448c0 35.3 28.7 64 64 64H320c35.3 0 64-28.7 64-64V160H256c-17.7 0-32-14.3-32-32V0H64zM256 0V128H384L256 0zM153 289l-31 31 31 31c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0L71 337c-9.4-9.4-9.4-24.6 0-33.9l48-48c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9zM265 255l48 48c9.4 9.4 9.4 24.6 0 33.9l-48 48c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l31-31-31-31c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0z"/></svg>`
        break;
      // microsoft word
      case 'doc':
      case 'docx':
      case 'rtf':
        icon = `<svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 384 512"><!--! Font Awesome Free 6.4.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><style>svg{fill: ${this.fileIconColor}}</style><path d="M64 0C28.7 0 0 28.7 0 64V448c0 35.3 28.7 64 64 64H320c35.3 0 64-28.7 64-64V160H256c-17.7 0-32-14.3-32-32V0H64zM256 0V128H384L256 0zM111 257.1l26.8 89.2 31.6-90.3c3.4-9.6 12.5-16.1 22.7-16.1s19.3 6.4 22.7 16.1l31.6 90.3L273 257.1c3.8-12.7 17.2-19.9 29.9-16.1s19.9 17.2 16.1 29.9l-48 160c-3 10-12 16.9-22.4 17.1s-19.8-6.2-23.2-16.1L192 336.6l-33.3 95.3c-3.4 9.8-12.8 16.3-23.2 16.1s-19.5-7.1-22.4-17.1l-48-160c-3.8-12.7 3.4-26.1 16.1-29.9s26.1 3.4 29.9 16.1z"/></svg>`
        break;
        // microsoft exel
      case 'xls':
      case 'csv':
      case 'xlsx':
        icon = `<svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 384 512"><!--! Font Awesome Free 6.4.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><style>svg{fill: ${this.fileIconColor}}</style><path d="M64 0C28.7 0 0 28.7 0 64V448c0 35.3 28.7 64 64 64H320c35.3 0 64-28.7 64-64V160H256c-17.7 0-32-14.3-32-32V0H64zM256 0V128H384L256 0zM155.7 250.2L192 302.1l36.3-51.9c7.6-10.9 22.6-13.5 33.4-5.9s13.5 22.6 5.9 33.4L221.3 344l46.4 66.2c7.6 10.9 5 25.8-5.9 33.4s-25.8 5-33.4-5.9L192 385.8l-36.3 51.9c-7.6 10.9-22.6 13.5-33.4 5.9s-13.5-22.6-5.9-33.4L162.7 344l-46.4-66.2c-7.6-10.9-5-25.8 5.9-33.4s25.8-5 33.4 5.9z"/></svg>`
      break;
      // pdf
      case 'pdf':
        icon = `<svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512"><!--! Font Awesome Free 6.4.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><style>svg{fill: ${this.fileIconColor}}</style><path d="M0 64C0 28.7 28.7 0 64 0H224V128c0 17.7 14.3 32 32 32H384V304H176c-35.3 0-64 28.7-64 64V512H64c-35.3 0-64-28.7-64-64V64zm384 64H256V0L384 128zM176 352h32c30.9 0 56 25.1 56 56s-25.1 56-56 56H192v32c0 8.8-7.2 16-16 16s-16-7.2-16-16V448 368c0-8.8 7.2-16 16-16zm32 80c13.3 0 24-10.7 24-24s-10.7-24-24-24H192v48h16zm96-80h32c26.5 0 48 21.5 48 48v64c0 26.5-21.5 48-48 48H304c-8.8 0-16-7.2-16-16V368c0-8.8 7.2-16 16-16zm32 128c8.8 0 16-7.2 16-16V400c0-8.8-7.2-16-16-16H320v96h16zm80-112c0-8.8 7.2-16 16-16h48c8.8 0 16 7.2 16 16s-7.2 16-16 16H448v32h32c8.8 0 16 7.2 16 16s-7.2 16-16 16H448v48c0 8.8-7.2 16-16 16s-16-7.2-16-16V432 368z"/></svg>`
        break;
        // audio
      case 'aac':
      case 'aiff':
      case 'dsd':
      case 'flac':
      case 'mp3':
      case 'mqa':
      case 'ogg':
      case 'wav':
      case 'wma':
        icon = `<svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 384 512"><!--! Font Awesome Free 6.4.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><style>svg{fill: ${this.fileIconColor}}</style><path d="M64 0C28.7 0 0 28.7 0 64V448c0 35.3 28.7 64 64 64H320c35.3 0 64-28.7 64-64V160H256c-17.7 0-32-14.3-32-32V0H64zM256 0V128H384L256 0zm2 226.3c37.1 22.4 62 63.1 62 109.7s-24.9 87.3-62 109.7c-7.6 4.6-17.4 2.1-22-5.4s-2.1-17.4 5.4-22C269.4 401.5 288 370.9 288 336s-18.6-65.5-46.5-82.3c-7.6-4.6-10-14.4-5.4-22s14.4-10 22-5.4zm-91.9 30.9c6 2.5 9.9 8.3 9.9 14.8V400c0 6.5-3.9 12.3-9.9 14.8s-12.9 1.1-17.4-3.5L113.4 376H80c-8.8 0-16-7.2-16-16V312c0-8.8 7.2-16 16-16h33.4l35.3-35.3c4.6-4.6 11.5-5.9 17.4-3.5zm51 34.9c6.6-5.9 16.7-5.3 22.6 1.3C249.8 304.6 256 319.6 256 336s-6.2 31.4-16.3 42.7c-5.9 6.6-16 7.1-22.6 1.3s-7.1-16-1.3-22.6c5.1-5.7 8.1-13.1 8.1-21.3s-3.1-15.7-8.1-21.3c-5.9-6.6-5.3-16.7 1.3-22.6z"/></svg>`
        break;
        // video
      case 'mp4':
      case 'mov':
      case 'wmv':
      case 'avi':
      case 'avcd':
      case 'flv':
      case 'f4v':
      case 'swf':
      case 'mkv':
      case 'mpeg-2':
      case 'webm':
        icon = `<svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 384 512"><!--! Font Awesome Free 6.4.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><style>svg{fill: ${this.fileIconColor}}</style><path d="M64 0C28.7 0 0 28.7 0 64V448c0 35.3 28.7 64 64 64H320c35.3 0 64-28.7 64-64V160H256c-17.7 0-32-14.3-32-32V0H64zM256 0V128H384L256 0zm2 226.3c37.1 22.4 62 63.1 62 109.7s-24.9 87.3-62 109.7c-7.6 4.6-17.4 2.1-22-5.4s-2.1-17.4 5.4-22C269.4 401.5 288 370.9 288 336s-18.6-65.5-46.5-82.3c-7.6-4.6-10-14.4-5.4-22s14.4-10 22-5.4zm-91.9 30.9c6 2.5 9.9 8.3 9.9 14.8V400c0 6.5-3.9 12.3-9.9 14.8s-12.9 1.1-17.4-3.5L113.4 376H80c-8.8 0-16-7.2-16-16V312c0-8.8 7.2-16 16-16h33.4l35.3-35.3c4.6-4.6 11.5-5.9 17.4-3.5zm51 34.9c6.6-5.9 16.7-5.3 22.6 1.3C249.8 304.6 256 319.6 256 336s-6.2 31.4-16.3 42.7c-5.9 6.6-16 7.1-22.6 1.3s-7.1-16-1.3-22.6c5.1-5.7 8.1-13.1 8.1-21.3s-3.1-15.7-8.1-21.3c-5.9-6.6-5.3-16.7 1.3-22.6z"/></svg>`
        break;
      case 'jpeg':
      case 'jpg':
      case 'png':
      case 'bmp':
      case 'tiff':
      case 'psd':
      case 'raw':
      case 'gif':
        icon = `<svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 384 512"><!--! Font Awesome Free 6.4.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><style>svg{fill: ${this.fileIconColor}}</style><path d="M64 0C28.7 0 0 28.7 0 64V448c0 35.3 28.7 64 64 64H320c35.3 0 64-28.7 64-64V160H256c-17.7 0-32-14.3-32-32V0H64zM256 0V128H384L256 0zM64 256a32 32 0 1 1 64 0 32 32 0 1 1 -64 0zm152 32c5.3 0 10.2 2.6 13.2 6.9l88 128c3.4 4.9 3.7 11.3 1 16.5s-8.2 8.6-14.2 8.6H216 176 128 80c-5.8 0-11.1-3.1-13.9-8.1s-2.8-11.2 .2-16.1l48-80c2.9-4.8 8.1-7.8 13.7-7.8s10.8 2.9 13.7 7.8l12.8 21.4 48.3-70.2c3-4.3 7.9-6.9 13.2-6.9z"/></svg>`
        break;
      case 'zip':
      case '7zip':
      case 'rar':
        icon = `<svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 384 512"><!--! Font Awesome Free 6.4.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><style>svg{fill: ${this.fileIconColor}}</style><path d="M64 0C28.7 0 0 28.7 0 64V448c0 35.3 28.7 64 64 64H320c35.3 0 64-28.7 64-64V160H256c-17.7 0-32-14.3-32-32V0H64zM256 0V128H384L256 0zM96 48c0-8.8 7.2-16 16-16h32c8.8 0 16 7.2 16 16s-7.2 16-16 16H112c-8.8 0-16-7.2-16-16zm0 64c0-8.8 7.2-16 16-16h32c8.8 0 16 7.2 16 16s-7.2 16-16 16H112c-8.8 0-16-7.2-16-16zm0 64c0-8.8 7.2-16 16-16h32c8.8 0 16 7.2 16 16s-7.2 16-16 16H112c-8.8 0-16-7.2-16-16zm-6.3 71.8c3.7-14 16.4-23.8 30.9-23.8h14.8c14.5 0 27.2 9.7 30.9 23.8l23.5 88.2c1.4 5.4 2.1 10.9 2.1 16.4c0 35.2-28.8 63.7-64 63.7s-64-28.5-64-63.7c0-5.5 .7-11.1 2.1-16.4l23.5-88.2zM112 336c-8.8 0-16 7.2-16 16s7.2 16 16 16h32c8.8 0 16-7.2 16-16s-7.2-16-16-16H112z"/></svg>`
        break;
      default:
        icon = `<svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 384 512"><!--! Font Awesome Free 6.4.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><style>svg{fill: ${this.fileIconColor}}</style><path d="M0 64C0 28.7 28.7 0 64 0H224V128c0 17.7 14.3 32 32 32H384V448c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V64zm384 64H256V0L384 128z"/></svg>`
        break;
    }
    return icon
  }

}

const uploader = new Uploader();
uploader.init();
