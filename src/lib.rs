use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::{
    account_info::{next_account_info, AccountInfo}, entrypoint::ProgramResult, entrypoint, msg, pubkey::Pubkey
};

#[derive(BorshDeserialize, BorshSerialize)]
pub struct Counter {
    count: u32
}

#[derive(BorshDeserialize, BorshSerialize)]
enum CounterInstructions {
    Increment(u32),
    Decremnet(u32)
}

entrypoint!(process_instruction);

pub fn process_instruction(
    _program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8]
) -> ProgramResult {
    let account = next_account_info(&mut accounts.iter())?;
    let mut counter = Counter::try_from_slice(&account.data.borrow())?;

    match CounterInstructions::try_from_slice(instruction_data)? {
        CounterInstructions::Increment(amount) => {
            counter.count += amount
        },
        CounterInstructions::Decremnet(amount) => {
            counter.count -= amount
        },
    }

    counter.serialize(&mut *account.data.borrow_mut())?;
    msg!("Counter Updated to {}", counter.count);

    Ok(())
}