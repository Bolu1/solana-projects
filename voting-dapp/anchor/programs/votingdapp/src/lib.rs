#![allow(clippy::result_large_err)]

use anchor_lang::prelude::*;

declare_id!("JAVuBXeBZqXNtS73azhBDAoYaaAFfo4gWXoZe2e7Jf8H");

#[program]
pub mod votingdapp {

    use super::*;

    pub fn initialize_poll(context:Context<InitializePoll>, poll_id: u64, description: String, poll_start: u64, poll_end: u64) -> Result<()> {
        
        let poll = &mut context.accounts.poll;
        poll.poll_id = poll_id;
        poll.description = description;
        poll.poll_start = poll_start;
        poll.poll_end = poll_end;

        Ok(())
    }

    pub fn initialize_candidate(context:Context<InitializeCandidate>, _poll_id: u64, candidate_name: String,) -> Result<()> {
        let candidate = &mut context.accounts.candidate;
        let poll = &mut context.accounts.poll;

        poll.candidate_amount += 1;
        candidate.number_of_votes = 0;
        candidate.candidate_name = candidate_name;

        Ok(())
    }

    pub fn vote(context:Context<Vote>, _poll_id: u64, _candidate_name: String) -> Result<()> {
        let candiate = &mut context.accounts.candidate;
        
        candiate.number_of_votes += 1;
        Ok(())
    }
}


#[derive(Accounts)]
#[instruction(poll_id: u64)]
pub struct InitializePoll<'info> {

    #[account(mut)]
    pub signer: Signer<'info>,

    #[account(
        init,
        payer = signer,
        space = 8 + Poll::INIT_SPACE,
        seeds = [poll_id.to_le_bytes().as_ref()],
        bump
    )]
    pub poll: Account<'info, Poll>,
    pub system_program: Program<'info, System>,
}

#[account]
#[derive(InitSpace)]
pub struct Poll {
    pub poll_id: u64,
    #[max_len(32)]
    pub description: String,
    pub poll_start: u64,
    pub poll_end: u64,
    pub candidate_amount: u64
}


#[derive(Accounts)]
#[instruction(poll_id: u64, candidate_name: String)]
pub struct InitializeCandidate<'info> {

    #[account(mut)]
    pub signer: Signer<'info>,

    #[account(
        mut,
        seeds = [poll_id.to_le_bytes().as_ref()],
        bump
    )]
    pub poll: Account<'info, Poll>,

    #[account(
        init,
        payer = signer, 
        space = 8 + Candidate::INIT_SPACE,
        seeds = [poll_id.to_le_bytes().as_ref(), candidate_name.as_bytes()],
        bump
    )]
    pub candidate: Account<'info, Candidate>,
    pub system_program: Program<'info, System>,
}


#[derive(Accounts)]
#[instruction(poll_id: i64, candidate_name: String)]
pub struct Vote<'info> {
    pub signer: Signer<'info>,

    #[account(
        seeds = [poll_id.to_le_bytes().as_ref()],
        bump
    )]
    pub poll: Account<'info, Poll>,

    #[account(
        mut,
        seeds = [poll_id.to_le_bytes().as_ref(), candidate_name.as_bytes()],
        bump
    )]
    pub candidate: Account<'info, Candidate>,
    pub system_program: Program<'info, System>,
}

#[account]
#[derive(InitSpace)]
pub struct Candidate {
    #[max_len(32)]
    pub candidate_name: String,
    pub number_of_votes: u64
}