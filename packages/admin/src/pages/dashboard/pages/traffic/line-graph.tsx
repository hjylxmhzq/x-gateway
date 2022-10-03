import React, { useEffect, useRef, useState } from 'react';
import * as echarts from 'echarts/core';
import style from './index.module.less';
import {
  BarChart,
  // 系列类型的定义后缀都为 SeriesOption
  BarSeriesOption,
  LineChart,
  LineSeriesOption
} from 'echarts/charts';
import {
  TitleComponent,
  // 组件类型的定义后缀都为 ComponentOption
  TitleComponentOption,
  TooltipComponent,
  TooltipComponentOption,
  GridComponent,
  GridComponentOption,
  // 数据集组件
  DatasetComponent,
  DatasetComponentOption,
  // 内置数据转换器组件 (filter, sort)
  TransformComponent,
  DataZoomComponent,
  DataZoomComponentOption,
  LegendComponent,
  LegendComponentOption,
  ToolboxComponent,
  ToolboxComponentOption,
} from 'echarts/components';
import { LabelLayout, UniversalTransition } from 'echarts/features';
import { CanvasRenderer } from 'echarts/renderers';
import { getProxyTrafficByName } from '../../../../apis/traffic';
import { Divider, Switch } from 'antd';

// 通过 ComposeOption 来组合出一个只有必须组件和图表的 Option 类型
type ECOption = echarts.ComposeOption<
  | BarSeriesOption
  | LineSeriesOption
  | TitleComponentOption
  | TooltipComponentOption
  | GridComponentOption
  | DatasetComponentOption
  | DataZoomComponentOption
  | LegendComponentOption
  | ToolboxComponentOption
>;

// 注册必须的组件
echarts.use([
  TitleComponent,
  TooltipComponent,
  GridComponent,
  DatasetComponent,
  TransformComponent,
  BarChart,
  LineChart,
  LabelLayout,
  UniversalTransition,
  CanvasRenderer,
  LegendComponent,
  DataZoomComponent,
  ToolboxComponent,
]);

interface IProps {
  proxyName?: string;
  displayType: 'accumulation' | 'normal';
}

export const LineGraph: React.FC<IProps> = (props: IProps) => {

  const { proxyName, displayType } = props;
  const chartContainerRef = useRef(null);
  const chartRef = useRef<echarts.ECharts | undefined>();

  useEffect(() => {
    if (chartContainerRef.current) {
      const chart = echarts.init(chartContainerRef.current);
      chartRef.current = chart;
    }
  }, []);

  useEffect(() => {
    (async () => {
      if (!proxyName || !chartRef.current) return;
      const traffics = await getProxyTrafficByName({ name: proxyName });
      const xAxis: string[] = [];
      const download: number[] = [];
      const upload: number[] = [];
      traffics.forEach((traffic, idx) => {
        xAxis.push(new Date(traffic.realTime).toLocaleString());
        const trafficReceived = idx === 0 || displayType === 'accumulation'
          ? traffic.trafficReceived
          : traffic.trafficReceived - traffics[idx - 1].trafficReceived;
        const trafficSent = idx === 0 || displayType === 'accumulation'
          ? traffic.trafficSent
          : traffic.trafficSent - traffics[idx - 1].trafficSent;
        download.push(trafficReceived / 1024 / 1024);
        upload.push(trafficSent / 1024 / 1024);
      });
      const option = createOption(xAxis, download, upload);
      chartRef.current.setOption(option);
    })();
  }, [proxyName, displayType]);

  return <div>
    <div className={style['chart-container']} ref={chartContainerRef}></div>
  </div>
}

function createOption(xAxis: string[], download: number[], upload: number[]) {
  const option: ECOption = {
    title: {
      text: '上传/下载流量',
      left: 'center'
    },
    grid: {
      bottom: 80,
      left: 50,
      right: 50
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        animation: false,
        label: {
          backgroundColor: '#505765'
        }
      }
    },
    legend: {
      data: ['Down', 'Up'],
      left: 20
    },
    dataZoom: [
      {
        show: true,
        realtime: true,
        start: 65,
        end: 100
      },
      {
        type: 'inside',
        realtime: true,
        start: 65,
        end: 100
      }
    ],
    xAxis: [
      {
        type: 'category',
        boundaryGap: false,
        axisLine: { onZero: false },
        // prettier-ignore
        data: xAxis
      }
    ],
    yAxis: [
      {
        name: 'Download(MB)',
        type: 'value'
      },
      {
        name: 'Upload(MB)',
        nameLocation: 'start',
        alignTicks: true,
        type: 'value',
        inverse: true
      }
    ],
    series: [
      {
        name: 'Down',
        type: 'line',
        areaStyle: {},
        lineStyle: {
          width: 1
        },
        emphasis: {
          focus: 'series'
        },
        markArea: {
          silent: true,
          itemStyle: {
            opacity: 0.3
          },
          data: [
            [
              {
                xAxis: '2009/9/12\n7:00'
              },
              {
                xAxis: '2009/9/22\n7:00'
              }
            ]
          ]
        },
        // prettier-ignore
        data: download
      },
      {
        name: 'Up',
        type: 'line',
        yAxisIndex: 1,
        areaStyle: {},
        lineStyle: {
          width: 1
        },
        emphasis: {
          focus: 'series'
        },
        markArea: {
          silent: true,
          itemStyle: {
            opacity: 0.3
          },
          data: [
            [
              {
                xAxis: '2009/9/10\n7:00'
              },
              {
                xAxis: '2009/9/20\n7:00'
              }
            ]
          ]
        },
        // prettier-ignore
        data: upload,
      }
    ]
  };
  return option;
}