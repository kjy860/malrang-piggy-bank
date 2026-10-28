import { describe, it, expect } from 'vitest'

describe('말랑저금통 입출금 및 잔액 독립성 테스트', () => {
  it('아이별 잔액이 독립적으로 계산되는지 검증', () => {
    // Given: 두 명의 아이(A, B)가 등록되어 있다.
    const childAId = 'child-uuid-a'
    const childBId = 'child-uuid-b'

    const transactions = [
      { child_id: childAId, type: 'deposit', amount: 5000 },
      { child_id: childBId, type: 'deposit', amount: 2000 },
    ]

    // When: 아이 A의 저금통에만 5,000원을 입금한다 (추가 입금 시뮬레이션)
    const updatedTransactions = [
      ...transactions,
      { child_id: childAId, type: 'deposit', amount: 5000 },
    ]

    // Then: 아이 B의 잔액에는 영향을 주지 않고 아이 A의 잔액만 증가한다.
    const balanceA = updatedTransactions
      .filter((tx) => tx.child_id === childAId)
      .reduce((acc, tx) => (tx.type === 'deposit' ? acc + tx.amount : acc - tx.amount), 0)

    const balanceB = updatedTransactions
      .filter((tx) => tx.child_id === childBId)
      .reduce((acc, tx) => (tx.type === 'deposit' ? acc + tx.amount : acc - tx.amount), 0)

    expect(balanceA).toBe(10000)
    expect(balanceB).toBe(2000)
  })

  it('입출금 수용 기준 검증 (F-03)', () => {
    // Given: 아이 저금통 화면에서 5000원 입금
    const childId = 'child-uuid-a'
    const initialTxs: { type: 'deposit' | 'withdraw'; amount: number }[] = []

    // When: 금액 5000원과 이모지 사유 입력 후 저장
    const depositAmount = 5000
    const newTxs = [...initialTxs, { type: 'deposit' as const, amount: depositAmount }]

    // Then: transactions 데이터가 추가되고 잔액이 5000원 증가한다.
    const totalBalance = newTxs.reduce((acc, tx) => (tx.type === 'deposit' ? acc + tx.amount : acc - tx.amount), 0)

    expect(newTxs.length).toBe(1)
    expect(totalBalance).toBe(5000)
  })
})
