import api from './mockApi'

export async function fetchRedeemOptions() {
    return api.getRedeemOptions()
}

export async function applyRedeem(optionId: string) {
    return api.redeem(optionId)
}

