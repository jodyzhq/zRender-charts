/**
 * @Author:      zhanghq
 * @DateTime:    2017-09-21 08:56:13
 * @Description: 添加轴线
 * @Last Modified By:   zhanghq
 * @Last Modified Time:    2017-09-21 08:56:13
 */

import d3 from 'd3'
import _ from 'lodash'
import zrender from 'zrender'

export default class XAxis {

  defaultSetting() {
    return {
      yAxis: { 
        rectItem: {
          width: 120, 
          height: 32,
          fill: '#1b1b50',
          stroke: '#493aa8',
          r: [6, 6, 6, 6],
          lineWidth: 1,
          opacity: 0.8
        }
      },
      // y轴配置项
      xAxis: { 
        // y轴线条配置项
        axisLine: {
          stroke: '#496d96'
        },
        // 文字配置
        label: { 
          color: '#fff',
          fontSize: 16,
          textAlign: 'start'
        },
        // 刻度线配置
        axisTick: {
          color: '#454c72'
        },
        min: 0,
        format: '', // 格式化
        ticks: 8 // y轴坐标刻度
      }
    }
  }

  /**
   * Creates an instance of addAxis
   * @param {object} zr zr容器
   * @param {object} opt 配置项
   */
  constructor(zr, opt) {
    this.zr = zr
    const defaultSetting = this.defaultSetting()
    this.config = _.merge({}, defaultSetting, opt)
  }

  /**
   *  渲染x轴
   *  @param    {array}  data 图表数据
   *  @return   {void}
   */
  render(data) {
    const self = this
    const { margin, height, xWidth, yAxis } = self.config
    const { left, bottom } = margin
    const { width: rectW } = yAxis.rectItem
    this.axisG = new zrender.Group()
    this.axisG.position = [left + rectW, height - bottom]
    
    // 求最大值
    self.max = self.formatMax(data)
 
    // x轴比例尺
    let scale = d3.scale.linear()
      .domain([0, self.max * 1.01])
      .range([0, xWidth - rectW])
    // x轴文字比例尺
    self.xScale = d3.scale.linear()
      .domain([0, data.length - 1])
      .range([0, xWidth - rectW])
    // 轴线
    self.axisLine()
    // 文字  
    self.axisLabel(data)
    // 添加到画面中
    this.zr.add(this.axisG)
    return scale
  }

  /**
   *  画x轴线
   *  @return   {void}  void
   */
  axisLine() {
    const { xWidth, xAxis } = this.config
    const { axisLine } = xAxis
  
    // 实例化线条
    const line = new zrender.Line({
      shape: {
        x1: 0,
        x2: xWidth
      },
      style: {
        lineWidth: 1,
        stroke: axisLine.stroke
      }
    })
    this.axisG.add(line)
  }

  /**
   *  求最大值
   *  @example: [10, 15, 5, 20, 50]
   *  @param    {array}  data 数据
   *  @return   {number}  最大值
   */
  formatMax(data) {
    const { ticks } = this.config.xAxis
    let max = d3.max(data)
    if(max < 10) {
      return max
    }
    // 求最小公倍数
    let minValue = max % (10 * ticks)
    max = max - minValue + 10 * ticks
    return max
  }

  /**
   * 添加x轴文字
   * @param {array} data   数据
   * @return   {void}  
   */
  axisLabel() {
    // 创建x轴文字
    const { xWidth, xAxis, yAxis } = this.config
    const { ticks, label, min, format } = xAxis
    const { width: rectW } = yAxis.rectItem
    let textsG = new zrender.Group()
    let max = this.max

    // 比例刻度计算
    for(let i = 0; i <= ticks; i++) {
      let value = (max - min) / ticks
      let range = min + i * value
      // 实例化文字
      const text = new zrender.Text({
        cursor: 'default',
        style: {
          text: Math.round(range) + format,
          textAlign: label.textAlign,
          x: 0,
          y: 10,
          textFill: label.color,
          opacity: 0
        }
      })
      text.animateTo({
        style: {
          x: (xWidth - rectW) / ticks * i,
          opacity: 1
        }
      }, 400)
      textsG.add(text)
    }
    // 添加到组元素
    this.axisG.add(textsG)
  }
}
