import { BankrunProvider, startAnchor } from 'anchor-bankrun'
import { Votingdapp } from '../target/types/votingdapp'
import { PublicKey } from '@solana/web3.js'

import { BN, Program, workspace, setProvider, AnchorProvider } from '@coral-xyz/anchor'

import IDL from '../target/idl/votingdapp.json'

const votingAddress = new PublicKey('JAVuBXeBZqXNtS73azhBDAoYaaAFfo4gWXoZe2e7Jf8H')

describe('votingdapp', () => {
  let context
  let provider
  setProvider(AnchorProvider.env())
  let votingProgram = workspace.Voting as Program<Votingdapp>;

  beforeAll(async () => {
    // context = await startAnchor('', [{ name: 'votingdapp', programId: votingAddress }], [])
    // provider = new BankrunProvider(context)

    // votingProgram = new Program<Votingdapp>(IDL as Votingdapp, provider)
  })

  it('Initalize Poll', async () => {
    await votingProgram.methods
      .initializePoll(new BN(1), 'What is your favourite fruit', new BN(0), new BN(1956712758))
      .rpc()

    const [pollAddress] = PublicKey.findProgramAddressSync([new BN(1).toArrayLike(Buffer, 'le', 8)], votingAddress)

    const poll = await votingProgram.account.poll.fetch(pollAddress)

    console.log(poll)

    expect(poll.pollId.toNumber()).toEqual(1)
    expect(poll.description).toEqual('What is your favourite fruit')
  })

  it('Initialize Candidates', async () => {
    await votingProgram.methods.initializeCandidate(new BN(1), 'Apple').rpc()

    await votingProgram.methods.initializeCandidate(new BN(1), 'Orange').rpc()

    const [appleAddress] = PublicKey.findProgramAddressSync(
      [new BN(1).toArrayLike(Buffer, 'le', 8), Buffer.from('Apple')],
      votingAddress,
    )

    const appleCandidate = await votingProgram.account.candidate.fetch(appleAddress)
    console.log(appleCandidate)
  })

  it('Vote', async () => {
    await votingProgram.methods.vote(new BN(1), 'Apple').rpc()

    const [appleAddress] = PublicKey.findProgramAddressSync(
      [new BN(1).toArrayLike(Buffer, 'le', 8), Buffer.from('Apple')],
      votingAddress,
    )

    const appleCandidate = await votingProgram.account.candidate.fetch(appleAddress)

    console.log(appleCandidate)
  })
})
