#![allow(clippy::result_large_err)]

use anchor_lang::prelude::*;

declare_id!("8rkBvuJnavwTPV6oinfQC3n3PDFicgHobYbrJj9NFyYu");

#[program]
pub mod crudapp {
    use super::*;

    pub fn initialize_journal_entry_state(context: Context<InitializeJournalEntryState>, title: String, message: String)-> Result<()> {
        let journal_entry_state = &mut context.accounts.journal_entry_state;
        journal_entry_state.title = title;
        journal_entry_state.message = message;

        Ok(())
    }

    pub fn update_journal_entry_state(context: Context<UpdateJournalEntryState>, _title: String, message: String)-> Result<()> {
        let journal_entry_state = &mut context.accounts.journal_entry_state;
        journal_entry_state.message = message;

        Ok(())
    }

    pub fn delete_journal_entry(_context: Context<DeleteJournalEntry>, _title: String)-> Result<()> {

        Ok(())
    }

}

#[derive(Accounts)]
#[instruction(title: String, message: String)]
pub struct InitializeJournalEntryState <'info> {

    #[account(mut)]
    pub signer: Signer<'info>,

    #[account(
        init,
        payer = signer,
        space = 8 + JournalEntryState::INIT_SPACE,
        seeds = [title.as_bytes(), signer.key().as_ref()],
        bump
    )]
    pub journal_entry_state: Account<'info, JournalEntryState>,

    pub system_program: Program<'info, System>
}

#[derive(Accounts)]
#[instruction(title: String, message: String)]
pub struct UpdateJournalEntryState <'info> {

    #[account(mut)]
    pub signer: Signer<'info>,

    #[account(
        mut,
        seeds = [title.as_bytes(), signer.key().as_ref()],
        bump,
        realloc = 8 + JournalEntryState::INIT_SPACE,
        realloc::payer = signer,
        realloc::zero = true,
    )]
    pub journal_entry_state: Account<'info, JournalEntryState>,

    pub system_program: Program<'info, System>
}

#[derive(Accounts)]
#[instruction(title: String)]
pub struct DeleteJournalEntry<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,

    #[account(
        mut,
        seeds = [title.as_bytes(), signer.key().as_ref()],
        bump,
        close = signer,
    )]
    pub journal_entry_state: Account<'info, JournalEntryState>,

    pub system_program: Program<'info, System>
}


#[account]
#[derive(InitSpace)]
pub struct JournalEntryState {
    pub owner: Pubkey,
    #[max_len(50)]
    pub title: String,
    #[max_len(1000)]
    pub message: String,
}