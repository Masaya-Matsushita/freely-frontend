import { Button, CloseButton, Modal, Slider } from '@mantine/core'
import { Dropzone } from '@mantine/dropzone'
import { useDisclosure } from '@mantine/hooks'
import { IconPhoto } from '@tabler/icons'
import { useState } from 'react'
import type { Area, MediaSize } from 'react-easy-crop'
import Cropper from 'react-easy-crop'
import { useErrorHandler } from 'react-error-boundary'

// urlをもとにimage要素を作成
const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image()
    image.addEventListener('load', () => resolve(image))
    image.addEventListener('error', (error) => reject(error))
    image.src = url
  })

// 画像トリミングを行い新たな画像urlを作成
const getCroppedImg = async (
  imageSrc: string,
  pixelCrop: Area,
): Promise<string> => {
  const image = await createImage(imageSrc)
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    return ''
  }
  // canvasサイズを設定
  canvas.width = image.width
  canvas.height = image.height
  // canvas上に画像を描画
  ctx.drawImage(image, 0, 0)
  // トリミング後の画像を抽出
  const data = ctx.getImageData(
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
  )
  // canvasのサイズ指定(切り取り後の画像サイズに更新)
  canvas.width = pixelCrop.width
  canvas.height = pixelCrop.height
  // 抽出した画像データをcanvasの左隅に貼り付け
  ctx.putImageData(data, 0, 0)

  // canvasを画像(Base64)に変換
  return canvas.toDataURL('image/jpeg')
}

/**
 * @package
 */
export const ImageDropzone = () => {
  const [croppedImgSrc, setCroppedImgSrc] = useState('')
  const [imgSrc, setImgSrc] = useState('')
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [minZoom, setMinZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area>()
  const [opened, handler] = useDisclosure(false)
  const handleError = useErrorHandler()

  // 横幅400pxで16:9のトリミング領域
  const ASPECT_RATIO = 16 / 9
  const CROP_WIDTH = 400

  // 画像ファイルをアップロードしてモーダルに表示
  const onFileChange = async (files: File[]) => {
    if (files && files.length > 0) {
      const reader = new FileReader()
      reader.addEventListener('load', () => {
        if (reader.result) {
          setImgSrc(reader.result.toString() || '')
          handler.open()
        }
      })
      // 画像をBase64エンコード
      reader.readAsDataURL(files[0])
    }
  }

  // 画像のZoomデフォルト値を設定
  const onMediaLoaded = (mediaSize: MediaSize) => {
    const { width, height } = mediaSize
    const mediaAspectRadio = width / height
    // 画像のアスペクト比が大きい(画像が横長)の場合
    if (mediaAspectRadio > ASPECT_RATIO) {
      // 縦幅に合わせてZoomのデフォルト値を指定
      const result = CROP_WIDTH / ASPECT_RATIO / height
      setZoom(result)
      setMinZoom(result)
      return
    }
    // 横幅に合わせてZoomのデフォルト値を指定
    const result = CROP_WIDTH / width
    setZoom(result)
    setMinZoom(result)
  }

  // 画像の切り取り情報を更新
  // ユーザーが画像の移動やZoomの操作をやめたときに呼ばれる
  const onCropComplete = (croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }

  // 切り取った画像のプレビューを表示
  const showCroppedImage = async () => {
    if (!croppedAreaPixels) return
    try {
      const croppedImage = await getCroppedImg(imgSrc, croppedAreaPixels)
      setCroppedImgSrc(croppedImage)
      handler.close()
    } catch (error) {
      handleError(error)
    }
  }

  return (
    <div>
      {/* 画像トリミング用モーダル */}
      <Modal
        opened={opened}
        onClose={() => handler.close()}
        closeOnClickOutside={false}
        closeOnEscape={false}
        withCloseButton={false}
        size='lg'
        className='mx-2 mt-16'
      >
        <div className='relative mx-4 mt-4 h-[300px] bg-dark-100'>
          <Cropper
            image={imgSrc}
            crop={crop}
            zoom={zoom}
            minZoom={minZoom}
            maxZoom={minZoom + 3}
            aspect={ASPECT_RATIO}
            onCropChange={setCrop}
            onCropComplete={onCropComplete}
            onZoomChange={setZoom}
            cropSize={{
              width: CROP_WIDTH,
              height: CROP_WIDTH / ASPECT_RATIO,
            }}
            onMediaLoaded={onMediaLoaded}
            showGrid={true}
          />
        </div>
        <div className='mx-auto mt-4 max-w-sm'>
          <div className='ml-1'>Zoom</div>
          <Slider
            size='lg'
            value={zoom}
            onChange={setZoom}
            min={minZoom}
            max={minZoom + 3}
            step={0.1}
            label={null}
            marks={[
              { value: minZoom, label: '×1' },
              { value: minZoom + 1.5, label: '×2.5' },
              { value: minZoom + 3, label: '×4' },
            ]}
          />
        </div>
        <div className='mt-16 mb-6 mr-8 flex justify-end gap-6'>
          <Button
            color='red'
            variant='outline'
            onClick={() => handler.close()}
            className='h-11 w-36 font-bold'
          >
            Cancel
          </Button>
          <Button onClick={showCroppedImage} className='h-11 w-36 font-bold'>
            OK
          </Button>
        </div>
      </Modal>
      <div className='max-w-xs'>
        {croppedImgSrc ? (
          <div>
            <div className='mx-1 flex items-end justify-between text-dark-500'>
              <div>この写真を設定</div>
              <CloseButton
                size='md'
                iconSize={24}
                onClick={() => setCroppedImgSrc('')}
              />
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={croppedImgSrc}
              alt='画像の描画に失敗しました。'
              className='h-[180px] w-[320px]'
            />
          </div>
        ) : (
          <Dropzone
            onDrop={onFileChange}
            onReject={(files) => console.log('rejected files', files)}
            maxSize={3 * 1024 ** 2}
            accept={{ 'image/*': [] }}
            className='mt-7 flex h-[180px] flex-col items-center justify-center border-[1px] text-center md:max-w-sm'
          >
            <div>
              <IconPhoto size={40} stroke={1} color='#999999' />
              <div className='text-dark-300'>タップで写真を選択</div>
            </div>
          </Dropzone>
        )}
      </div>
    </div>
  )
}