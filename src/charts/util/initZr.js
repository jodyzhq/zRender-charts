import zrender from 'zrender'

/**
 *  zrender初始化
 *  @param    {string}  selector 容器元素选择器
 *  @param    {number}  width    canvas宽
 *  @param    {number}  height   canvas高
 *  @return   {object}  canvas元素
 */
export const InitZr = (selector, width, height) => {
  const zr = zrender.init(document.querySelector(selector), {
    renderer: 'canavs',
    width: width,
    height: height
  })
  return zr 
}

