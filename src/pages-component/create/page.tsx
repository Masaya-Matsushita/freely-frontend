import { PasswordInput, TextInput } from '@mantine/core'
import { DateRangePicker } from '@mantine/dates'
import type { DateRangePickerValue } from '@mantine/dates'
import { useForm } from '@mantine/form'
import {
  IconCalendar,
  IconCalendarMinus,
  IconKey,
  IconMap,
} from '@tabler/icons'
import { useRouter } from 'next/router'
import { useState } from 'react'
import { Notes } from './Notes'
import { Card } from 'src/component/Card'
import { ContentLabel } from 'src/component/ContentLabel'
import { SimpleButton } from 'src/component/SimpleButton'
import { Stepper } from 'src/component/Stepper'
import { useMediaQuery } from 'src/lib/mantine'
import 'dayjs/locale/ja'
import { Step } from 'src/type/Step'

type FormValues = {
  name: string
  dateRange: DateRangePickerValue
  password: string
  confirmPassword: string
}

/**
 * @package
 */
export const Create = () => {
  const router = useRouter()
  const largerThanXs = useMediaQuery('xs')
  const largerThanMd = useMediaQuery('md')
  const [active, setActive] = useState<('filled' | 'active' | 'blank')[]>([
    'active',
    'blank',
    'blank',
  ])

  // フォームの初期値、バリデーション
  const form = useForm<FormValues>({
    initialValues: {
      name: '',
      dateRange: [null, null],
      password: '',
      confirmPassword: '',
    },

    validate: {
      name: (value) =>
        !value.length
          ? 'プラン名をご入力ください'
          : value.length > 40
          ? '40字以内でご設定ください'
          : null,
      dateRange: (value) =>
        !value[0] || !value[1] ? '日程をご選択ください' : null,
      password: (value) =>
        !value || /^([a-zA-Z0-9]{6,})$/.test(value)
          ? null
          : '半角英数6~20文字でご設定ください',
      confirmPassword: (value, values) =>
        value !== values.password ? 'パスワードの値が一致しません' : null,
    },
  })

  // フォームの入力箇所までactiveを進める
  const updateActive = () => {
    const valList = [
      form.values.name,
      form.values.dateRange[1],
      form.values.confirmPassword,
    ]
    const activeList: ('filled' | 'active' | 'blank')[] = [
      'active',
      'blank',
      'blank',
    ]

    // 未入力のフォーム以降は全てblank
    for (let i = 0; i < valList.length; i++) {
      if (!valList[i]) {
        break
      }
      activeList[i] = 'filled'
      activeList[i + 1] = 'active'
    }
    setActive(activeList)
  }

  // Stepperの要素
  const stepList: Step[] = [
    {
      id: 0,
      icon: <IconMap size={largerThanMd ? 30 : 24} color='#495057' />,
      label: 'プラン名',
      text: '後から変更も可能です',
      children: (
        <TextInput
          placeholder='(例) 3泊4日で東京観光！'
          onBlur={updateActive}
          size={largerThanMd ? 'md' : 'sm'}
          classNames={{ input: 'max-w-xs md:max-w-sm' }}
          {...form.getInputProps('name')}
        />
      ),
    },
    {
      id: 1,
      icon: <IconCalendar size={largerThanMd ? 30 : 24} color='#495057' />,
      label: '日程を選択',
      text: '後から変更も可能です',
      children: (
        <DateRangePicker
          locale='ja'
          placeholder='日付を選択'
          onBlur={updateActive}
          firstDayOfWeek='sunday'
          inputFormat='YYYY/MM/DD'
          labelFormat='YYYY/MM'
          size={largerThanMd ? 'md' : 'sm'}
          classNames={{ input: 'max-w-xs md:max-w-sm' }}
          {...form.getInputProps('dateRange')}
        />
      ),
    },
    {
      id: 2,
      icon: <IconKey size={largerThanMd ? 30 : 24} color='#495057' />,
      label: '共有パスワード',
      text: '他のメンバーと共同で編集する場合のみ設定してください(任意)',
      children: (
        <div>
          <PasswordInput
            placeholder='半角英数6~20文字'
            size={largerThanMd ? 'md' : 'sm'}
            classNames={{
              visibilityToggle: 'hidden',
              input: 'max-w-xs md:max-w-sm',
            }}
            {...form.getInputProps('password')}
          />
          <PasswordInput
            placeholder='再度入力してください'
            onBlur={updateActive}
            size={largerThanMd ? 'md' : 'sm'}
            classNames={{
              visibilityToggle: 'hidden',
              input: 'mt-2 max-w-xs md:max-w-sm md:mt-3',
            }}
            {...form.getInputProps('confirmPassword')}
          />
        </div>
      ),
    },
  ]

  const handleError = () => {
    console.log('失敗しました。入力値をご確認ください。')
  }

  const handleSubmit = (values: typeof form.values) => {
    console.log(values)
  }

  return (
    <>
      <ContentLabel
        label='プラン作成'
        icon={
          <IconCalendarMinus size={largerThanXs ? 44 : 36} color='#6466F1' />
        }
      />
      <form onSubmit={form.onSubmit(handleSubmit, handleError)}>
        <Card>
          {stepList.map((step) => {
            return (
              <Stepper
                key={step.id}
                active={active[step.id]}
                step={{
                  id: step.id,
                  icon: step.icon,
                  label: step.label,
                  text: step.text,
                  longer: step.longer,
                }}
              >
                {step.children}
              </Stepper>
            )
          })}
        </Card>
        <div className='flex justify-center py-20'>
          <SimpleButton text='作成する' type='submit' />
        </div>
      </form>
      <Notes />
    </>
  )
}
