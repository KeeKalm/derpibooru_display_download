// ==UserScript==
// @name         derpibooru.org display download
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description
// @author       K
// @include      https://derpibooru.org/*
// @include      http://derpibooru.org/*
// ==/UserScript==

// 确定显图片
var x=document.getElementById("image-display");
var img_display_link = x.src;

// 确定图片名字
var y=document.getElementsByTagName("a");
var img_link;
for (var i=0;i<y.length;i++)
{
    if (y[i].title == "Download (tags in filename)")
    {
        img_link = y[i].href;
        console.log(img_link);
        //img_display_link=img_link;
        break;
    }
}
var j = img_link.lastIndexOf("/") +1 ;
var img_name = img_link.substring(j);
//target="_blank"

// 确定超链接信息
var display_download=document.createElement("a")
var textnode=document.createTextNode("DisplayDown")
display_download.appendChild(textnode)

//把显示图片链接键入href属性
var dispay_href=document.createAttribute("href");
dispay_href.value=img_display_link;
display_download.setAttributeNode(dispay_href);

/*
//键入新建窗口打开属性
var dispay_act1=document.createAttribute("target");
dispay_act1.value="_blank";
display_download.setAttributeNode(dispay_act1);
*/

//把文件名键入download属性
var display_name = document.createAttribute("download");
display_name.value=img_name;
display_download.setAttributeNode(display_name);

//确定超链接位子
var parent = y[i].parentNode;
parent.insertBefore(display_download,y[i]);


console.log("img_display_link is %s \n", img_display_link);
console.log("img_name is %s \n", img_name);
console.log("display_download's href %s \n", display_download.href);
console.log("display_download's download %s \n", display_download.download);

