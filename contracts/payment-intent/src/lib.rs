#![no_std]

use soroban_sdk::{contract, contractimpl, contracttype, Address, BytesN, Env, Symbol};

#[derive(Clone)]
#[contracttype]
pub enum DataKey {
    Admin,
    NextId,
    Intent(u64),
}

#[derive(Clone)]
#[contracttype]
pub struct PaymentIntent {
    pub id: u64,
    pub payer: Address,
    pub merchant: Address,
    pub amount: i128,
    pub asset: Address,
    pub memo: Symbol,
    pub created_at: u64,
    pub paid: bool,
    pub tx_hash: Option<BytesN<32>>,
}

#[contract]
pub struct PaymentIntentContract;

#[contractimpl]
impl PaymentIntentContract {
    pub fn initialize(env: Env, admin: Address) {
        if env.storage().instance().has(&DataKey::Admin) {
            panic!("already initialized");
        }
        admin.require_auth();
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::NextId, &0u64);
    }

    pub fn create_intent(
        env: Env,
        payer: Address,
        merchant: Address,
        amount: i128,
        asset: Address,
        memo: Symbol,
    ) -> u64 {
        payer.require_auth();

        if amount <= 0 {
            panic!("amount must be positive");
        }

        let next_id: u64 = env.storage().instance().get(&DataKey::NextId).unwrap_or(0u64);
        let intent = PaymentIntent {
            id: next_id,
            payer,
            merchant,
            amount,
            asset,
            memo,
            created_at: env.ledger().timestamp(),
            paid: false,
            tx_hash: None,
        };

        env.storage().instance().set(&DataKey::Intent(next_id), &intent);
        env.storage().instance().set(&DataKey::NextId, &(next_id + 1));
        next_id
    }

    pub fn mark_paid(env: Env, intent_id: u64, tx_hash: BytesN<32>) {
        let admin = Self::get_admin(env.clone());
        admin.require_auth();

        let mut intent = Self::get_intent(env.clone(), intent_id);
        intent.paid = true;
        intent.tx_hash = Some(tx_hash);
        env.storage()
            .instance()
            .set(&DataKey::Intent(intent_id), &intent);
    }

    pub fn get_intent(env: Env, intent_id: u64) -> PaymentIntent {
        env.storage()
            .instance()
            .get(&DataKey::Intent(intent_id))
            .unwrap_or_else(|| panic!("intent not found"))
    }

    pub fn get_admin(env: Env) -> Address {
        env.storage()
            .instance()
            .get(&DataKey::Admin)
            .unwrap_or_else(|| panic!("contract not initialized"))
    }
}
