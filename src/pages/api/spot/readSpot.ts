import type { NextApiRequest, NextApiResponse } from 'next'
const url = require('url')

const readSpot = async (req: NextApiRequest, res: NextApiResponse) => {
  const params = await url.parse(req.url, true).query
  const data = await fetch(
    `http://0.0.0.0/spot?plan_id=${params.planId}&spot_id=${params.spotId}`,
  )
  res.status(200).json(await data.json())
}

export default readSpot