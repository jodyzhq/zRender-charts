/*
 * @Author: zhanghongqiao@hiynn.com 
 * @Date: 2018-02-01 10:39:20 
 * @Description: 玫瑰图图例
 * @Last Modified by: zhanghongqiao@hiynn.com
 * @Last Modified time: 2018-02-01 22:23:04
 */
 
import zrender from 'zrender'

export default class Legend {
  
  /**
   * Creates an instance of Legend.
   * @param {object} root  玫瑰图实例对象
   * @return {void}  void
   */
  constructor(root) {
    this.root = root
    this.config = root.config
    this.zr = root.zr
    this.isInit = root.isInit
    this.pie = root.pie
    // 实例圆点组
    this.circleGroup = new zrender.Group()
    // 实例文字组
    this.textGroup = new zrender.Group() 
    this.legendGroup = new zrender.Group()
  }
  
  /**
   * 初始化组
   * @param  {any}   data  图表数据 
   * @return {void}  void
   */  
  initGroup(data) {
    data.map((d, i) => {
      let group = new zrender.Group({
        silent: false,
        cursor: 'pointer',
        state: true,
        name: data[i].name
      })
      // 实例化圆
      let circle = new zrender.Circle()
      // 实例化文字
      let text = new zrender.Text()
      group.add(circle)
      group.add(text)
      this.legendGroup.add(group)
    })
    this.zr.add(this.legendGroup)    
  }
  /** 
   * 渲染图例
   * @param  {any} data 图例数据
   * @return {void}  void
   */
  render(data) {
    // 初始化
    if(this.isInit){
      this.initGroup(data)
    } 
    // 渲染小圆点
    this.setCircleAttribute(data)
    // 渲染文字
    this.setTextAttribute(data)
  }

  /**
   * 圆点属性设置
   * @param  {array} data 图表数据 
   * @return {void}  void
   */
  setCircleAttribute(data) {
    const self = this
    const { width, itemStyle } = this.config
    const { colors } = itemStyle
    let len = this.legendGroup._children.length
    let newData = JSON.parse(JSON.stringify(data))
    this.legendGroup.eachChild((group, i) => {
      let circle = group._children[0]
      circle.attr({
        shape: {
          r: 10,
          cx: width / len * i + width / len / 2,
          cy: 10
        },
        style: {
          fill: colors[i]
        }
      })
      
      // 图例点击
      group.on('click', function() {
        this.state = !this.state
        let name = this.name
        // 判断当前状态(显示隐藏)
        if(!this.state){
          this._children[0].style.fill = '#ccc'
          self.eachPieGroup(data, newData, name, 1)
        }else{
          // 图例颜色还原
          this._children[0].style.fill = colors[i]
          // 查找圆弧
          self.eachPieGroup(data, newData, name, 2)
        }
      })
    })
  }

  eachPieGroup(data, newData, name, type) {
    let pieGroup = this.root.pieGroup
    pieGroup.eachChild((arc, j) => {
      if(name === arc.attr().data.name) {
        // 还原数据
        newData[j].value = type === 1 ? 0 : data[j].value
        let pieData = this.pie(newData)
        // 重新渲染数据
        this.root.setPieAttribute(pieData)
      }
    })
  }
  /**
   * 文字属性设置
   * @param  {array} data 图表数据 
   * @return {void}  void
   */
  setTextAttribute(data) {
    const { width } = this.config
    let len = this.legendGroup._children.length
    this.legendGroup.eachChild((group, i) => {
      let text = group._children[1]
      text.attr({
        style: {
          text: data[i].name,
          textFill: '#fff',
          textAlign: 'center',
          x: width / len * i + width / len / 2,
          y: 25
        }
      })
    })
  }
}
 
