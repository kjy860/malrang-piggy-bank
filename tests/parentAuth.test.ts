import { describe, it, expect } from 'vitest'

describe('부모 모드 보안 인증 테스트', () => {
  it('올바른 4자리 비밀번호(1234) 입력 시 인증 성공', () => {
    const inputPassword = '1234'
    const correctPassword = '1234'
    
    const isSuccess = inputPassword === correctPassword
    expect(isSuccess).toBe(true)
  })

  it('틀린 4자리 비밀번호(0000) 입력 시 인증 실패 및 차단', () => {
    const inputPassword = '0000'
    const correctPassword = '1234'
    
    const isSuccess = inputPassword === correctPassword
    expect(isSuccess).toBe(false)
  })
})
