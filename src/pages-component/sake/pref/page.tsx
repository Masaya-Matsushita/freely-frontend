import { Divider } from '@mantine/core'
import { useRouter } from 'next/router'
import { FC } from 'react'
import { PrefSelectBox } from 'src/component/PrefSelectBox'
import { SakeData } from 'src/type/SakeData'

/**
 * @package
 */
export const Sake: FC<{ data: SakeData }> = (props) => {
  const router = useRouter()

  // パスのクエリにplanIdが無いとき
  if (router.isReady && !router.query.plan_id) {
    throw new Error(
      '不正なパス遷移として検出されました。Top画面から入り直してください。',
    )
  }

  return (
    <>
      <PrefSelectBox />
      <div className='mt-8 ml-6 space-y-2 text-xl xs:ml-8 xl:mx-auto xl:w-[1048px]'>
        地酒一覧
      </div>
      <div className='mx-4 mt-6 space-y-2 xs:mx-6 xl:mx-auto xl:w-[1056px]'>
        {props.data.map((sake) => {
          return (
            <div key={sake.name}>
              <div className='ml-2 text-lg text-dark-500'>
                {sake.name}
                <span className='ml-1 text-sm text-dark-300'>{sake.en}</span>
              </div>
              {sake.makerUrl ? (
                <a
                  href={sake.makerUrl}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='ml-2 text-sm'
                >
                  {sake.makerName}
                </a>
              ) : (
                <div className='ml-2 text-sm'>{sake.makerName}</div>
              )}
              <Divider mt='sm' />
            </div>
          )
        })}
        <div className='mr-2 text-end text-xs text-dark-400 md:text-sm'>
          取得元：Sakenote Database API
        </div>
      </div>
    </>
  )
}
