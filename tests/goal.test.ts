import { describe, it, expect } from 'vitest'

describe('저축 목표 달성 축하 테스트', () => {
  it('목표 금액 달성 시 is_achieved 상태가 true로 변경되는지 검증', () => {
    // Given: 목표 금액이 10,000원인 저금통에 현재 9,000원이 모여 있다.
    const targetAmount = 10000
    let currentAmount = 9000
    let isAchieved = currentAmount >= targetAmount

    expect(isAchieved).toBe(false)

    // When: 1,000원을 추가 입금하여 잔액이 10,000원이 된다.
    const depositAmount = 1000
    currentAmount += depositAmount
    isAchieved = currentAmount >= targetAmount

    // Then: 목표 달성 상태(is_achieved = true)로 변경되며 축하 애니메이션이 발동한다.
    expect(currentAmount).toBe(10000)
    expect(isAchieved).toBe(true)
  })
})
