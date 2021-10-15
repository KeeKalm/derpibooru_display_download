// ==UserScript==
// @name         derpibooru.org display download
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description
// @author       K
// @include      http*://derpibooru.org/images/*
// @grant       GM_xmlhttpRequest
// @grant       GM_download
// @connect     derpicdn.net
// ==/UserScript==

let img_info = new Object();

/**
 * 跨域请求下载相应
 * @param {*} img_url 
 */
function download_start(img_url) {
    GM_xmlhttpRequest({
        method: 'GET',
        url: img_url, /// @@ 下载所对应的URL
        headers: {
            referer: 'https://derpibooru.org/'
        },
        responseType: 'blob',	/// @@ 返回值格式
        onabort: function () { },	/// @@ 下载终止
        onprogress: function (xhr) {
        },
        onload: function (xhr) {	/// @@ 请求已加载
            let blobURL = window.URL.createObjectURL(xhr.response); // 返回的blob对象是整个response，而非responseText
            download_to_disk(blobURL, fullFileName); // @@ 下载到硬盘
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

// // 确定显图片
// var x=document.getElementById("image-display");
// var img_display_link = x.src;

// // 确定图片名字
// var y=document.getElementsByTagName("a");
// var img_link;
// for (var i=0;i<y.length;i++)
// {
//     if (y[i].title == "Download (tags in filename)")
//     {
//         img_link = y[i].href;
//         console.log(img_link);
//         //img_display_link=img_link;
//         break;
//     }
// }
// var j = img_link.lastIndexOf("/") +1 ;
// var img_name = img_link.substring(j);
// //target="_blank"

// // 确定超链接信息
// var display_download=document.createElement("a")
// var textnode=document.createTextNode("DisplayDown")
// display_download.appendChild(textnode)

// //把显示图片链接键入href属性
// var dispay_href=document.createAttribute("href");
// dispay_href.value=img_display_link;
// display_download.setAttributeNode(dispay_href);

// /*
// //键入新建窗口打开属性
// var dispay_act1=document.createAttribute("target");
// dispay_act1.value="_blank";
// display_download.setAttributeNode(dispay_act1);
// */

// //把文件名键入download属性
// var display_name = document.createAttribute("download");
// display_name.value=img_name;
// display_download.setAttributeNode(display_name);

// //确定超链接位子
// var parent = y[i].parentNode;
// parent.insertBefore(display_download,y[i]);


// console.log("img_display_link is %s \n", img_display_link);
// console.log("img_name is %s \n", img_name);
// console.log("display_download's href %s \n", display_download.href);
// console.log("display_download's download %s \n", display_download.download);
