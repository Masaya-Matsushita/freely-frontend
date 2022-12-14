import type { NextApiRequest, NextApiResponse } from 'next'

const updatePlan = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const data = await fetch(`${process.env.API_URL}/plan`, {
      method: 'PUT',
      headers: { 'Content-type': 'application/json' },
      body: JSON.stringify(req.body),
    })
    // エラー
    if (!data.ok) {
      throw new Error(String(data.status))
    }
    res.status(200).json(await data.json())
  } catch (error: any) {
    const errorCode = Number(error.message)
    res.status(errorCode).json(errorCode)
  }
}

export default updatePlan
