import { Carousel } from '@mantine/carousel'
import { Spoiler } from '@mantine/core'
import { IconChevronDown, IconChevronUp } from '@tabler/icons'
import { useRouter } from 'next/router'
import { FC } from 'react'
import { ThreeHourlyList } from './ThreeHourlyList'
import { WeatherCard } from './WeatherCard'
import { WeeklyWeatherCard } from './WeeklyWeatherCard'
import { prefList } from 'src/lib/const'
import { useMediaQuery } from 'src/lib/mantine'
import { WeatherData } from 'src/type/WeatherData'

/**
 * @package
 */
export const Forecast: FC<{ data: WeatherData }> = (props) => {
  const largerThanLg = useMediaQuery('lg')
  const router = useRouter()
  const prefId = router.query.prefId
  const prefData = prefList.filter((pref) => pref.id === prefId)
  const cityName = props.data.city
  const weeklyList = props.data.weekly

  return (
    <div>
      {props.data ? (
        <div>
          <div className='mx-auto mt-10 w-[95vw] text-sm text-dark-300 xs:w-[85vw] xs:text-base sm:w-[calc(95vw-276px)] md:mt-16 xl:w-[1000px]'>
            ‹
            <span className='mx-1 text-dark-400'>
              {prefData[0].name}
              {cityName === '東京都' ? '新宿区' : cityName}
            </span>
            › の天気
          </div>
          <Carousel
            slideSize='33.333%'
            breakpoints={[
              { maxWidth: 'lg', slideSize: '40%' },
              { maxWidth: 'xs', slideSize: '45%' },
            ]}
            controlsOffset='xl'
            align='start'
            withControls={largerThanLg ? false : true}
            className='mx-auto max-w-[95vw] xs:max-w-[85vw] sm:max-w-[calc(95vw-276px)] xl:max-w-[1000px]'
          >
            <Carousel.Slide>
              <WeatherCard day={weeklyList[0]} label='今日' />
            </Carousel.Slide>
            <Carousel.Slide>
              <WeatherCard day={weeklyList[1]} label='明日' />
            </Carousel.Slide>
            <Carousel.Slide>
              <WeatherCard day={weeklyList[2]} label='明後日' />
            </Carousel.Slide>
          </Carousel>
          <Spoiler
            maxHeight={208}
            showLabel={
              <div className='w-[95vw] border-[1px] border-solid border-slate-50 border-t-slate-200 xs:w-[85vw] sm:w-[calc(95vw-286px)]'>
                <IconChevronDown
                  color='#3b82f6'
                  stroke={3}
                  size={28}
                  className='mx-auto mt-1'
                />
              </div>
            }
            hideLabel={
              <div className='w-[95vw] border-[1px] border-solid border-slate-50 border-t-slate-200 xs:w-[85vw] sm:w-[calc(95vw-286px)]'>
                <IconChevronUp
                  color='#3b82f6'
                  stroke={3}
                  size={28}
                  className='mx-auto mt-1'
                />
              </div>
            }
            className='mx-auto mt-4 w-[95vw] max-w-[1000px] shadow-md xs:w-[85vw] sm:w-[calc(95vw-276px)]'
          >
            <div className='flex'>
              <div className='flex h-[340px] w-10 shrink-0 flex-col items-center bg-white text-sm text-dark-500 shadow-lg xs:w-14 xs:text-base'>
                <div className='mt-4'>時刻</div>
                <div className='mt-[106px] xs:mt-[88px]'>気温</div>
                <div className='mt-[17px] xs:mt-4'>降水</div>
                <div className='mt-[17px] xs:mt-4'>湿度</div>
                <div className='mt-12'>風</div>
              </div>
              <ThreeHourlyList threeHourlyList={props.data.threeHourly} />
            </div>
          </Spoiler>
          <div className='mx-auto mt-8 w-[95vw] max-w-[1000px] xs:w-[85vw] sm:mt-12 sm:w-[calc(95vw-276px)] md:mt-20 lg:w-[calc(85vw-286px)]'>
            <div className='ml-2 mb-1 text-dark-500 md:text-lg'>週間天気</div>
            {weeklyList.slice(2, 7).map((data) => {
              return (
                <div key={data.day}>
                  <WeeklyWeatherCard data={data} />
                </div>
              )
            })}
            <div className='mr-2 mt-6 text-end text-xs text-dark-400 md:text-sm'>
              <div>
                現在のデータ：
                <span className='mx-1 underline'>
                  {props.data.threeHourly[2].year}/
                  {props.data.threeHourly[2].month}/
                  {props.data.threeHourly[2].day}{' '}
                  {props.data.threeHourly[2].time}時発表
                </span>
                (最新)
              </div>
              <div className='mt-1 flex flex-col md:flex-row md:justify-end md:gap-3'>
                <div>取得元：Open Weather Map ( 3時間天気 )</div>
                <div>Open Meteo ( 3日間・週間天気 )</div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
