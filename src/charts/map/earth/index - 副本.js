/**
 * @Author:      zhanghq
 * @DateTime:    2018-01-11 16:15:29
 * @Description: 旋转地图
 * @Last Modified By:   zhanghq
 * @Last Modified Time:    2018-01-11 16:15:29
 */

import echarts from 'echarts'
import 'echarts-gl' 
import * as contour from '@/loader/common/scripts/d3-contour.js' 
import * as geo from '@/loader/common/scripts/d3-geo.js'
import * as timer from '@/loader/common/scripts/d3-timer.js' 
import _ from 'lodash'

import baseTexture from './images/skin-blue.jpg'
import heightTexture from './images/data-1491837512042-rJlLfXYax.jpg'
import detailTexture from './images/skin-blue.jpg'
import initImg from './images/data-1491837512042-rJlLfXYax.jpg' 
 
export default class Earth {
  /**
   * 地图默认配置项
   * @return {object} 默认配置项
   */
  defaultSetting() {
    return {
      // 动画光颜色
      color: '#c0101a',
      levels: 50,
      // 表层混合强度，就当是光晕
      threshold: 0.01,
      width: 4096,
      height: 2048,
      globe: {
        // 背景图
        // environment: environment,
      // 地图纹理
        baseTexture: baseTexture,
        heightTexture: heightTexture,
        displacementScale: 0.05,
        displacementQuality: 'high',
        shading: 'realistic',
        lambertMaterial:{
          detailTexture: detailTexture
        },
        postEffect: {
          enable: true,
          depthOfField: {
            // enable: true
          }
        },
        light: {
          ambient: {
            intensity: 1
          },
          main: {
            intensity: 1
          }
        },
        viewControl: {
          autoRotate: true
        },
        layers: [{
          type: 'blend',
          blendTo: 'emission',
          texture: '',
          shading: 'lambert',
          intensity: 4
        }]
      }
    }
  }

  /**
   * Creates an instance of Heatmap
   * @param {string} selector 容器元素选择器
   * @param {object} opt 图表组件配置项
   */
  constructor(selector, opt) { 
    this.selector = selector
    const defaultSetting = this.defaultSetting()
    this.config = _.merge({}, defaultSetting, opt)
    this.earth = echarts.init(document.getElementById(selector))
    let canvas = document.createElement('canvas')
    canvas.width = this.config.width
    canvas.height = this.config.height
    let context = canvas.getContext('2d')
    context.lineWidth = 0.5
    context.strokeStyle = this.config.color
    context.fillStyle = this.config.color
    context.shadowColor = this.config.color
    this.canvas = canvas
    this.context = context
    
  }

  image(url) {
    return new Promise(function (resolve) {
      let image = new Image()
      image.src = url
      image.onload = () => {
        let canvas = document.createElement('canvas')
        canvas.width = image.width / 8
        canvas.height = image.height / 8
        let context = canvas.getContext('2d')
        context.drawImage(image, 0, 0, canvas.width, canvas.height)
        resolve(context.getImageData(0, 0, canvas.width, canvas.height))
      }
    })
  }

  initCharts(opt) {
    const self = this
    let canvas = document.createElement('canvas')
    let contourChart = echarts.init(canvas, null, {
      width: 4096,
      height: 2048
    })
    let img = new echarts.graphic.Image({
      style: {
        image: opt.image,
        x: -1,
        y: -1,
        width: opt.image.width + 2,
        height: opt.image.height + 2
      }
    })

    contourChart.getZr().add(img) 
    opt.onupdate = () => {
      img.dirty()
    }
    self.earth.setOption(self.config)
  }

  render() {
    const self = this
    let canvas = self.canvas
    let context = self.context
    let config = self.config
    let results = []
    self.image(initImg).then((image) => {
      let m = image.height
      let n = image.width
      let values = new Array(n * m)
      let contours = contour.d3.contours().size([n, m]).smooth(true)
      let projection = geo.d3.geoIdentity().scale(canvas.width / n)
      let path = geo.d3.geoPath(projection, context)
      for (let j = 0, k = 0; j < m; ++j) {
        for (let i = 0; i < n; ++i, ++k) {
          values[k] = image.data[k << 2] / 255
        }
      }

      let opt = {
        image: canvas
      }
      
      function redraw() {
        results.forEach(function (d, idx) {
          context.beginPath()
          path(d)
          context.globalAlpha = 1
          context.stroke()
          if (idx > config.levels / 5 * 3) {
            context.globalAlpha = 0.01
            context.fill()
          }
        })
        opt.onupdate()
      }

      function update(threshold, levels) {
        context.clearRect(0, 0, canvas.width, canvas.height)
        let thresholds = []
        for (let x = 0; x < levels; x++) {
          thresholds.push((threshold + 1 / levels * x) % 1)
        }
        results = contours.thresholds(thresholds)(values)
        redraw()
      }

      timer.d3.timer(function (t) {
        let threshold = t % 10000 / 7000
        update(threshold, 1)
      })
 
      self.initCharts(opt)

      update(config.threshold, config.levels)
    })
  }
}
