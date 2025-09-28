import { LinkedAction } from './../../../../node_modules/@solana/actions-spec/index.d'
import { ActionGetResponse, ActionPostRequest, ACTIONS_CORS_HEADERS, createPostResponse } from '@solana/actions'
import { Connection, PublicKey, Transaction } from '@solana/web3.js'
import { BN, Program } from '@coral-xyz/anchor'

import { Votingdapp } from '@/../anchor/target/types/votingdapp'

import IDL from '@/../anchor/target/idl/votingdapp.json'

export const OPTIONS = GET

export async function GET(request: Request) {
  const actionMetaData: ActionGetResponse = {
    icon: 'https://hips.hearstapps.com/hmg-prod/images/assortment-of-colorful-ripe-tropical-fruits-top-royalty-free-image-1747173002.pjpeg?crop=1.00xw:0.751xh;0,0.0839xh&resize=1200:*',
    title: 'Vote for your favourite fruit',
    description: 'Vote for your favourite fruit',
    label: 'Vote',
    links: {
      actions: [
        {
          label: 'Vote for Apple',
          href: '/api/vote?candidate=Apple',
          type: 'post',
        },
        {
          label: 'Vote for Orange',
          href: '/api/vote?candidate=Orange',
          type: 'post',
        },
      ],
    },
  }
  return Response.json(actionMetaData, { headers: ACTIONS_CORS_HEADERS })
}

export async function POST(request: Request) {
  const url = new URL(request.url)
  const candidate = url.searchParams.get('candidate')

  if (candidate != 'Apple' && candidate != 'Orange') {
    return new Response('Invalid candidate', { status: 400, headers: ACTIONS_CORS_HEADERS })
  }

  const connection = new Connection('http://127.0.0.1:8899', 'confirmed')
  const program: Program<Votingdapp> = new Program(IDL as Votingdapp, { connection })
  const body: ActionPostRequest = await request.json()
  let voter

  try {
    voter = new PublicKey(body.account)
  } catch (error) {
    console.log(error)
    return new Response('Invalid account', { status: 400, headers: ACTIONS_CORS_HEADERS })
  }

  const instruction = await program.methods.vote(new BN(1), candidate).accounts({ signer: voter }).instruction()

  const blockhash = await connection.getLatestBlockhash()

  const transaction = new Transaction({
    feePayer: voter,
    blockhash: blockhash.blockhash,
    lastValidBlockHeight: blockhash.lastValidBlockHeight,
  }).add(instruction)

  const response = await createPostResponse({
    fields: {
      type: 'transaction',
      transaction: transaction,
    },
  })

  return Response.json(response, { headers: ACTIONS_CORS_HEADERS })
}
