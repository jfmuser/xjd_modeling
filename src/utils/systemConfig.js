import service from '@/apis/dept/authRequest'
/**
 * 
 * @param GET 请求参数 params
 * @param POST 请求参数 data
 * @returns 
 */
//post 添加 /登录
export function POST(url, data) {
    return new Promise((reslove, reject) => {
        service.request({
            url: url,
            method: "post",
            data: data
        }).then(res => {
            // console.log("login",res.data);
            reslove(res.data)
        }, err => {
            reject(err)
        }).catch(err => {
            reject(err)
        })
    })
}
/**
 * 
 * @param {*} url 地址
 * @param {*} appType appType
 * @param {*} jobId   jobId
 * @param {*} formdata  file 文件流
 * @param {*} config   headers: { "Content-Type": "multipart/form-data" },
 * @returns 
 */
// 上传文件 封装
export function POST_FILE(url, appType, jobId, data) {
    appType = appType || "";
    jobId = jobId || ""
    return new Promise((reslove, reject) => {
        service.request({
            url: url + "?appType=" + appType + "&jobId=" + jobId,
            method: "post",
            data,
            headers: { "Content-Type": "multipart/form-data" }
        }).then(res => {
            // console.log("login",res.data);
            reslove(res.data)
        }, err => {
            reject(err)
        }).catch(err => {
            reject(err)
        })
    })
}
/**
 * 
 * @param {*} url 
 * @param {*} currentPage 
 * @param {*} size 
 * @param {*} tradeCode 
 * @param {*} level 
 * @returns 
 */
// 分页查询
export function POSTPAGE(url, currentPage, size, tradeCode, level) {
    console.log("level11111", level);
    currentPage = currentPage || ""
    size = size || ""
    tradeCode = tradeCode || ""
    level = level + "" || ""
    return new Promise((reslove, reject) => {
        service.request({
            url: url + "?currentPage=" + currentPage + "&size=" + size + "&tradeCode=" + tradeCode + "&level=" + level,
            method: "get",
        }).then(res => {
            // console.log("login",res.data);
            reslove(res.data)
        }, err => {
            reject(err)
        }).catch(err => {
            reject(err)
        })
    })
}
// 雷达图
export function GET_RadarMap(url, sid) {
    sid = sid || ""
    return new Promise((reslove, reject) => {
        service.request({
            url: url + "/" + sid,
            method: "get",
        }).then(res => {
            // console.log("login",res.data);
            reslove(res.data)
        }, err => {
            reject(err)
        }).catch(err => {
            reject(err)
        })
    })
}
// 应用三企业信息列表
export function GET_INFO(url, currentPage, size, nameOrId) {
    currentPage = currentPage || ""
    size = size || ""
    nameOrId = nameOrId || ""
    return new Promise((reslove, reject) => {
        service.request({
            url: url + "?currentPage=" + currentPage + "&size=" + size + "&nameOrId=" + nameOrId,
            method: "get",
        }).then(res => {
            // console.log("login",res.data);
            reslove(res.data)
        }, err => {
            reject(err)
        }).catch(err => {
            reject(err)
        })
    })
}
// 应用二企业信息列表 带搜索
export function GET_TABLE_OPTION(url, type, currentPage, size, keyword) {
    type = type || ''
    currentPage = currentPage || ""
    size = size || ""
    keyword = keyword || ""
    return new Promise((reslove, reject) => {
        service.request({
            url: url + '/' + type + "?currentPage=" + currentPage + "&size=" + size + "&keyword=" + keyword,
            method: "get",
        }).then(res => {
            // console.log("login",res.data);
            reslove(res.data)
        }, err => {
            reject(err)
        }).catch(err => {
            reject(err)
        })
    })
}
//最新表格
export function GET_NEWTABLE(url, type, riskRange) {
    type = type || ''
    riskRange = riskRange || ""
    return new Promise((reslove, reject) => {
        service.request({
            url: url + '/' + type + '/' + riskRange,
            method: "get",
        }).then(res => {
            // console.log("login",res.data);
            reslove(res.data)
        }, err => {
            reject(err)
        }).catch(err => {
            reject(err)
        })
    })
}
// 获取能耗图表
export function GETRequire(url, appType, tradeCode) {
    appType = appType || ""
    tradeCode = tradeCode || ""
    return new Promise((reslove, reject) => {
        service.request({
            url: url + '/' + appType + "?tradeCode=" + tradeCode,
            method: "get",
        }).then(res => {
            reslove(res.data)
        }, err => {
            reject(err)
        }).catch(err => {
            reject(err)
        })
    })
}
//get 获取信息
export function GET(url, type) {
    //是否有参数没有就为空
    type = type || ''
    return new Promise((reslove, reject) => {
        service
            .request({
                //判断params对象中是否携带参数
                url: url + "/" + type,
                method: "get",
            }).then(res => {
                reslove(res.data)
            }, err => {
                reject(err)
            }).catch(err => {
                reject(err)
            })
    })
}
//flag
export function GET_flag(url, type, flag) {
    //是否有参数没有就为空
    type = type || ''
    flag = flag || ''
    return new Promise((reslove, reject) => {
        service
            .request({
                //判断params对象中是否携带参数
                url: url + "/" + type + "?flag=" + flag,
                method: "get",
            }).then(res => {
                reslove(res.data)
            }, err => {
                reject(err)
            }).catch(err => {
                reject(err)
            })
    })
}
export function GET_save(url, params) {

    return new Promise((reslove, reject) => {
        service
            .request({
                //判断params对象中是否携带参数
                url: url,
                method: "get",
                params: params
            }).then(res => {
                reslove(res.data)
            }, err => {
                reject(err)
            }).catch(err => {
                reject(err)
            })
    })
}
//get 获取信息
export function GET_ID(url, id) {
    //是否有参数没有就为空
    // params = params || {}
    id = id || ''
    return new Promise((reslove, reject) => {
        service
            .request({
                //判断params对象中是否携带参数
                url: url + "/" + id,
                method: "get",
                // params: params,
            }).then(res => {
                reslove(res.data)
            }, err => {
                reject(err)
            }).catch(err => {
                reject(err)
            })
    })
}
//level tradeCode
export function GET_level_tradeCode(url, level, tradeCode) {
    level = level || ''
    tradeCode = tradeCode || ''
    return new Promise((reslove, reject) => {
        service
            .request({
                //判断params对象中是否携带参数
                url: url + "/" + level + "?tradeCode=" + tradeCode,
                method: "get",
                // params: params,
            }).then(res => {
                reslove(res.data)
            }, err => {
                reject(err)
            }).catch(err => {
                reject(err)
            })
    })
}
//get type-customId
export function GET_TYPE_ID(url, type, customId) {
    //是否有参数没有就为空
    type = type || ''
    customId = customId || ''
    return new Promise((reslove, reject) => {
        service
            .request({
                //判断params对象中是否携带参数
                url: url + "/" + type + "/" + customId,
                method: "get",
            }).then(res => {
                console.log(res.data);
                reslove(res.data)
            }, err => {
                reject(err)
            }).catch(err => {
                reject(err)
            })
    })
}
//appType 获取信息
export function APPTYPEGET(url, appType) {
    appType = appType || ''
    return new Promise((reslove, reject) => {
        service
            .request({
                //判断params对象中是否携带参数
                url: url + "/" + appType,
                method: "get",
            }).then(res => {
                reslove(res.data)
            }, err => {
                reject(err)
            }).catch(err => {
                reject(err)
            })
    })
}
// delete 删除
export function DELETE(url, appType) {
    return new Promise((reslove, reject) => {
        service.request({
            url: url + "/" + appType,
            method: "post",
        }).then(res => {
            // console.log("del",res.data);
            reslove(res.data)
        }, err => {
            reject(err)
        }).catch(err => {
            reject(err)
        })
    })

}
// delete 批量删除
export function DELETEALL(url, params) {
    return new Promise((reslove, reject) => {
        service.request({
            url: url,
            method: "post",
            data: params
        }).then(res => {
            // console.log("del",res.data);
            reslove(res.data)
        }, err => {
            reject(err)
        }).catch(err => {
            reject(err)
        })
    })

}
//put 修改
export function PUT(url, data) {
    return new Promise((reslove, reject) => {
        service.request({
            url: url,
            method: "post",
            data: data
        }).then(res => {
            // console.log(res.data);
            reslove(res.data)
        }, err => {
            reject(err)
        }).catch(err => {
            reject(err)
        })
    })
}
//文件上传
// export function POSTZ_FILE(url, data, appType, jobId) {
//     //是否有参数没有就为空
//     appType = appType || ''
//     jobId = jobId || ''
//     return new Promise((reslove, reject) => {
//         service.request({
//             url: url + "?appType=" + appType + "&jobId=" + jobId,
//             method: "post",
//             data: data
//         }).then(res => {
//             // console.log(res.data);
//             reslove(res.data)
//         }, err => {
//             reject(err)
//         }).catch(err => {
//             reject(err)
//         })
//     })
// }
//GETID
export function GETID(url, id, params) {
    return new Promise((reslove, reject) => {
        service.request({
            url: url + "/" + id,
            method: "get",
            params: params
        }).then(res => {
            // console.log("id",res.data);
            reslove(res.data)
        }, err => {
            reject(err)
        }).catch(err => {
            reject(err)
        })
    })
}