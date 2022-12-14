import {
  CloseButton,
  LoadingOverlay,
  Modal,
  TextInput,
  UnstyledButton,
} from '@mantine/core'
import { FC, useReducer } from 'react'
import { useErrorHandler } from 'react-error-boundary'
import { AiOutlineSend } from 'react-icons/ai'
import { FaPen } from 'react-icons/fa'
import useSWR, { useSWRConfig } from 'swr'
import { MemoCardList } from './MemoCardList'
import { SpotMenu } from './SpotMenu'
import { initialState, reducer } from './memoState'
import { ConfirmDialog } from 'src/component/ConfirmDialog'
import { PasswordModal } from 'src/component/PasswordModal'
import { reloadAlert, useMediaQuery } from 'src/lib/mantine'

type Props = {
  opened: boolean
  close: () => void
  planId: string
  spotId: number
  spotName: string
  password: string | null
}

/**
 * @package
 */
export const MemoModal: FC<Props> = (props) => {
  const [state, dispatch] = useReducer(reducer, initialState)
  const catchError = useErrorHandler()
  const { mutate } = useSWRConfig()
  const largerThanXs = useMediaQuery('xs')
  const memoListUrl = `/api/memo/read?plan_id=${props.planId}&spot_id=${props.spotId}`

  // メモ取得
  // TODO: 全スポットごとに個別でAPIを叩くのはリクエストが多すぎる？
  // NOTE: メモを一括で取得 & クライアント側で取得データをスポットごとに加工 とすべき？
  const { data, error } = useSWR(memoListUrl)

  // 取得時のエラー
  if (error) {
    reloadAlert()
  }

  // メモ追加
  const handleSubmit = async () => {
    try {
      // 未入力 or 100字以上 のとき実行しない
      if (!state.memo || state.memo.length > 100) return

      dispatch({
        type: 'loading',
        payload: { loading: true },
      })
      // API通信
      const res = await fetch('/api/memo/create', {
        method: 'POST',
        headers: { 'Content-type': 'application/json' },
        body: JSON.stringify({
          password: props.password,
          plan_id: props.planId,
          spot_id: props.spotId,
          text: state.memo,
          marked: state.marked,
        }),
      })

      // 404以外のエラー
      if (!res.ok) {
        throw new Error('通信に失敗しました。時間を置いて再度お試しください。')
      }

      const json: boolean = await res.json()
      if (json) {
        // 作成成功
        await mutate(memoListUrl)
        dispatch({
          type: 'createMemoSuccess',
          payload: { memo: '', marked: 'White', loading: false },
        })
      } else {
        // パスワード認証に失敗
        dispatch({
          type: 'createMemoFailed',
          payload: { passwordModal: true, loading: false },
        })
      }
    } catch (error) {
      catchError(error)
    }
  }

  // メモ削除
  const deleteMemo = async () => {
    try {
      // API通信
      const res = await fetch('/api/memo/delete', {
        method: 'POST',
        headers: { 'Content-type': 'application/json' },
        body: JSON.stringify({
          password: props.password,
          plan_id: props.planId,
          spot_id: props.spotId,
          memo_id: state.targetMemoId,
        }),
      })

      // 404エラー
      if (res.status === 404) {
        throw new Error(
          '指定したプランが見つかりません。URLが誤っていないことをご確認ください。(404 Error)',
        )
      }
      // 404以外のエラー
      if (!res.ok) {
        throw new Error(
          'データの取得に失敗しました。時間を置いて再度お試しください。',
        )
      }

      const json: boolean = await res.json()
      if (json) {
        // 削除成功
        mutate(memoListUrl)
        dispatch({
          type: 'memoDialog',
          payload: { memoDialog: false },
        })
      } else {
        // パスワード認証に失敗
        dispatch({
          type: 'deleteMemoFailed',
          payload: { memoDialog: false, passwordModal: true },
        })
      }
    } catch (error) {
      catchError(error)
    }
  }

  // スポット削除
  const deleteSpot = async () => {
    try {
      // API通信
      const res = await fetch('/api/spot/delete', {
        method: 'POST',
        headers: { 'Content-type': 'application/json' },
        body: JSON.stringify({
          password: props.password,
          plan_id: props.planId,
          spot_id: props.spotId,
        }),
      })

      // 404エラー
      if (res.status === 404) {
        throw new Error(
          '指定したプランが見つかりません。URLが誤っていないことをご確認ください。(404 Error)',
        )
      }
      // 404以外のエラー
      if (!res.ok) {
        throw new Error(
          'データの取得に失敗しました。時間を置いて再度お試しください。',
        )
      }

      const json: boolean = await res.json()
      if (json) {
        // 削除成功
        await mutate(`/api/spot/readSpotList?planId=${props.planId}`)
        dispatch({
          type: 'spotDialog',
          payload: { spotDialog: false },
        })
        props.close()
      } else {
        // パスワード認証に失敗
        dispatch({
          type: 'deleteSpotFailed',
          payload: { spotDialog: false, passwordModal: true },
        })
      }
    } catch (error) {
      catchError(error)
    }
  }

  return (
    <div>
      <Modal
        opened={props.opened}
        onClose={props.close}
        withCloseButton={false}
        centered
        size='lg'
        classNames={{
          modal: 'p-0 pt-4 relative rounded-lg xs:mx-8 xxs:mx-4 max-w-[450px]',
        }}
      >
        <CloseButton
          title='閉じる'
          size='md'
          iconSize={32}
          onClick={props.close}
          className='absolute -top-8 right-3 hover:bg-dark-500'
        />
        <div className='mx-2 mb-3 flex items-center justify-between gap-1 xxs:mx-4'>
          <div className='ml-2 text-xl text-dark-500'>
            {largerThanXs && props.spotName.length > 16
              ? props.spotName.slice(0, 16) + '...'
              : !largerThanXs && props.spotName.length > 10
              ? props.spotName.slice(0, 10) + '...'
              : props.spotName}
          </div>
          <SpotMenu
            planId={props.planId}
            spotId={props.spotId}
            dialog={state.spotDialog}
            setDialog={(state: boolean) => {
              dispatch({
                type: 'spotDialog',
                payload: { spotDialog: state },
              })
            }}
            handleDelete={deleteSpot}
          />
        </div>
        <div className='relative'>
          <LoadingOverlay
            visible={state.loading}
            overlayBlur={0.5}
            overlayOpacity={0.5}
            overlayColor='#eaecf2'
          />
          <div className='h-[360px] overflow-auto border-[1px] border-solid border-main-200 border-y-dark-100 bg-main-200 py-6 pl-4 pr-3 xs:h-[400px] xs:px-6'>
            <MemoCardList
              spotId={props.spotId}
              open={(memoId: number) => {
                dispatch({
                  type: 'targetMemoId',
                  payload: { memoDialog: true, targetMemoId: memoId },
                })
              }}
              memoList={data}
            />
          </div>
        </div>
        <div className='mx-2 my-3 flex items-start gap-2 xxs:mx-4 xs:mx-6 xs:gap-4'>
          <UnstyledButton
            onClick={() =>
              dispatch({
                type: 'marked',
                payload: { marked: state.marked === 'White' ? 'Red' : 'White' },
              })
            }
            className='mt-1 rounded-md py-1 px-2 hover:bg-slate-100'
          >
            <FaPen
              color={state.marked === 'Red' ? '#ff2626' : '#999999'}
              size={22}
            />
          </UnstyledButton>
          <TextInput
            placeholder='時間、料金、持ち物など'
            value={state.memo}
            onChange={(e) =>
              dispatch({
                type: 'memo',
                payload: { memo: e.currentTarget.value },
              })
            }
            error={state.memo.length > 100 ? '100字以内でご入力ください' : null}
            disabled={state.loading}
            size={'sm'}
            classNames={{ input: 'rounded-2xl bg-slate-100' }}
            className='flex-1'
          />
          <UnstyledButton
            onClick={handleSubmit}
            className={`mx-[3px] rounded-md p-[5px] hover:bg-slate-100 ${
              state.loading ? 'bg-slate-100' : 'bg-white'
            }`}
          >
            <AiOutlineSend color='#495057' size={28} />
          </UnstyledButton>
        </div>
      </Modal>
      <ConfirmDialog
        name='メモ'
        opened={state.memoDialog}
        close={() =>
          dispatch({
            type: 'memoDialog',
            payload: { memoDialog: false },
          })
        }
        handleDelete={deleteMemo}
      />
      <PasswordModal
        opened={state.passwordModal}
        closeModal={() =>
          dispatch({
            type: 'passwordModal',
            payload: { passwordModal: false },
          })
        }
        planId={props.planId}
        clear
      />
    </div>
  )
}
