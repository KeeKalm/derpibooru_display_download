// ==UserScript==
// @name         derpibooru.org display download
// @namespace    http://tampermonkey.net/
// @version      1.1.2
// @description
// @author       K
// @include      http*://derpibooru.org/images/*
// @grant       GM_xmlhttpRequest
// @grant       GM_download
// @connect     derpicdn.net
// ==/UserScript==
let NameFormat = {
    DOWNLOAD_ELE_ORG: 1, // 原始下载元素
    DOWNLOAD_ELE_REG: 2, // 调整下载元素
}
let name_format = NameFormat.DOWNLOAD_ELE_REG;


let img_id; // 图片id
let img_rating;
let img_is_hidden = false;
let img_src_error;
let img_url_display;    // 当前页面展示的图片链接
let img_filename_from_download_ele;  // 页面下载所对应的url
let img_filename_for_buttom;    // 用于按钮下载的文件名

let site_download_place = 0;

/**
 * 跨域请求下载相应
 * @param {*} img_url
 */
function download_start(img_url, file_name) {
    GM_xmlhttpRequest({
        method: 'GET',
        url: img_url, /// @@ 下载所对应的URL
        headers: {
            referer: 'https://derpibooru.org/'
        },
        responseType: 'blob',	/// @@ 返回值格式
        onabort: function () { 
            alert("GM_xmlhttpRequest onabort");
        },	/// @@ 下载终止
        onprogress: function (xhr) {
        },
        onload: function (xhr) {	/// @@ 请求已加载
            let blobURL = window.URL.createObjectURL(xhr.response); // 返回的blob对象是整个response，而非responseText
            download_to_disk(blobURL, file_name); // @@ 下载到硬盘
        },
        onerror : function(){
            alert("GM_xmlhttpRequest onerror");
        }
    });
}

/**
 * blob下载到磁盘
 * @param {*} blobURL
 * @param {*} fullFileName
 */
function download_to_disk(blobURL, fullFileName) {
    GM_download({
        url: blobURL,
        name: fullFileName,
        onload: function () {
            window.URL.revokeObjectURL(blobURL);
        }
    });
}
/**
 * 获取显示图片的url
 */
function get_img_display_url() {
    let x = document.getElementById("image-display");
    img_url_display = x.src;
}

/**
 * 获取下载元素的文件名
 */
function get_img_filename_from_download_ele() {
    let x = document.getElementsByTagName("a");
    let img_link;
    for (site_download_place = 0; site_download_place < x.length; site_download_place++) {
        if (x[site_download_place].title == "Download (tags in filename)") {
            img_link = x[site_download_place].href;
            break;
        }
    }
    let j = img_link.lastIndexOf("/") + 1;
    img_filename_from_download_ele = img_link.substring(j);
}
/**
 * 获取图片id
 */
function get_img_id() {
    let xx = document.getElementsByClassName("upvotes")
    for (let i = 0; i < xx.length; i++) {
        img_id = xx[i].getAttribute("data-image-id");
    }
}
/**
 * 获取图片筛选
 */
function get_img_rating() {
    let xx = document.getElementsByClassName("tag dropdown")
    for (let i = 0; i < xx.length; i++) {
        if (xx[i].getAttribute("data-tag-category") == "rating") {
            img_rating = xx[i].getAttribute("data-tag-slug");
        }
    }
}
/**
 * 图片是否隐藏
 */
function is_img_hidden() {
    let xx = document.getElementsByClassName("hidden image-show");
    if (xx.length) {
        img_is_hidden = true;
    }
}
function is_msg_err(){
    let xx = document.getElementsByClassName("tag dropdown")
    for (let i = 0; i < xx.length; i++) {
        if (xx[i].getAttribute("data-tag-category") == "error") {
            img_src_error = xx[i].getAttribute("data-tag-slug");
        }
    }
}
function show_img() {
    let xx = document.getElementsByClassName("hidden image-show");
    for (let i = 0; i < xx.length; i++) {
        xx[i].setAttribute("class", "image-show");
    }
    xx = document.getElementsByClassName("block block--fixed block--warning block--no-margin image-filtered");
    for (let i = 0; i < xx.length; i++) {
        let xxx = xx[i].getElementsByTagName("p");
        xx[i].removeChild(xxx[0]);
    }
}
/**
 * 生成文件名，将作者放置到末尾
 * @returns
 */
function make_img_filename__imgid_artist_to_end() {
    let artist_list = new Array();
    let img_mid;
    let img_end;

    function get_artist_list() { // ## 获取作者列表
        let xx = document.getElementsByClassName("tag dropdown")
        for (let i = 0; i < xx.length; i++) {
            if (xx[i].getAttribute("data-tag-category") == "origin") {
                artist_list.push(xx[i].getAttribute("data-tag-slug"));
            }
        }
    }
    function match_downloadele() { // ## 解析名字
        let downloadele_head = img_id + "__" + img_rating + "_" + artist_list.join("_");
        downloadele_head = downloadele_head.replace("\+", "\\+");
        downloadele_head = downloadele_head.replace("\-", "\\-");
        let reg = RegExp(downloadele_head + "_" + "([\\w\\+\\-]+)" + "." + "([\\w\\+\\-]+)");
        let ret = img_filename_from_download_ele.match(reg);
        if (ret == null) {
            alert("图像匹配错误");
        }
        img_mid = ret[1];
        img_end = ret[2];
    }


    get_artist_list();
    console.log("[artist_list]=" + artist_list);
    if (artist_list.length == 0) {
        img_filename_for_buttom = img_filename_from_download_ele;

    } else {
        match_downloadele();
        img_filename_for_buttom = img_mid + "__" + artist_list.join("_") + "__" + img_id + "." + img_end;
    }
}
/**
 * 制作下载按钮的文件名
 */
function make_img_filename_for_bottom() {
    switch (name_format) {
        case NameFormat.DOWNLOAD_ELE_ORG:
            img_filename_for_buttom = img_filename_from_download_ele;
            break;
        case NameFormat.DOWNLOAD_ELE_REG:
            make_img_filename__imgid_artist_to_end();
            break;
        default:
            img_filename_for_buttom = img_filename_from_download_ele;
    }
}

/**
 * 设置下载按钮
 */
function set_download_button() {
    let display_download = document.createElement("button");
    let textnode = document.createTextNode("DisplayDown");
    display_download.appendChild(textnode);
    // display_download.addEventListener("click", "function()");
    display_download.onclick = function () {
        get_img_display_url();
        console.log("[img_url_display]=" + img_url_display);
        make_img_filename_for_bottom();
        console.log("[img_filename_for_buttom]=" + img_filename_for_buttom);
        download_start(img_url_display, img_filename_for_buttom);
    }

    let y = document.getElementsByTagName("a");
    let parent = y[site_download_place].parentNode;
    parent.insertBefore(display_download, y[site_download_place]);
}


get_img_filename_from_download_ele();
console.log("[img_filename_for_buttom]=" + img_filename_from_download_ele);

if (site_download_place > 0) {
    get_img_id();
    console.log("[img_id]=" + img_id);
    get_img_rating();
    console.log("[img_rating]=" + img_rating);
    is_img_hidden();
    console.log("[img_is_hidden]=" + img_is_hidden);
    is_msg_err();
    show_img();
    set_download_button();
}

