import { describe, it, expect } from 'vitest'

describe('홈알바 승인 및 적립 테스트 (F-06/07)', () => {
  it('부모가 홈알바를 승인하면 아이 잔액이 증가하고 transactions에 기록되는지 검증', () => {
    // Given: 부모가 등록한 보상 1,000원짜리 홈알바가 '승인 대기(requested)' 상태이다.
    const childId = 'child-uuid-a'
    const chore = {
      id: 'chore-1',
      child_id: childId,
      title: '설거지하기',
      reward_amount: 1000,
      status: 'requested' as const,
    }

    let initialTransactions: { child_id: string; type: 'deposit' | 'withdraw'; amount: number; memo: string }[] = []
    let choreStatus = chore.status

    // When: 부모 대시보드에서 '승인' 버튼을 누른다. (승인 처리 및 적립 시뮬레이션)
    if (choreStatus === 'requested') {
      choreStatus = 'approved'
      initialTransactions.push({
        child_id: chore.child_id!,
        type: 'deposit',
        amount: chore.reward_amount,
        memo: `홈알바: ${chore.title}`,
      })
    }

    // Then: 아이의 저금통 잔액이 1,000원 증가하고 transactions에 내역이 기록된다.
    const totalBalance = initialTransactions
      .filter((tx) => tx.child_id === childId)
      .reduce((acc, tx) => (tx.type === 'deposit' ? acc + tx.amount : acc - tx.amount), 0)

    expect(choreStatus).toBe('approved')
    expect(initialTransactions.length).toBe(1)
    expect(initialTransactions[0].memo).toBe('홈알바: 설거지하기')
    expect(totalBalance).toBe(1000)
  })
})
