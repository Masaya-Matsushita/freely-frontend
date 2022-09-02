import type { NextApiRequest, NextApiResponse } from 'next'
const url = require('url')

const plan = async (req: NextApiRequest, res: NextApiResponse) => {
  const params = await url.parse(req.url, true).query
  const data = await fetch(`http://0.0.0.0/plan?plan_id=${params.planId}`)
  res.status(200).json(await data.json())
}

export default plan