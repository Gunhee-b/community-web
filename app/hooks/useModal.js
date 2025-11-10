import { useState, useCallback } from 'react'

/**
 * 모달 상태 관리를 위한 재사용 가능한 커스텀 훅
 *
 * @param {boolean} initialState - 초기 모달 상태 (기본값: false)
 * @returns {Object} 모달 상태 및 제어 함수
 */
export const useModal = (initialState = false) => {
  const [isOpen, setIsOpen] = useState(initialState)

  const open = useCallback(() => {
    setIsOpen(true)
  }, [])

  const close = useCallback(() => {
    setIsOpen(false)
  }, [])

  const toggle = useCallback(() => {
    setIsOpen((prev) => !prev)
  }, [])

  return {
    isOpen,
    open,
    close,
    toggle,
  }
}

/**
 * 여러 모달을 관리하기 위한 훅
 *
 * @param {string[]} modalNames - 관리할 모달 이름 배열
 * @returns {Object} 각 모달의 상태 및 제어 함수
 *
 * @example
 * const modals = useModals(['edit', 'delete', 'confirm'])
 * modals.edit.open()
 * modals.delete.isOpen
 */
export const useModals = (modalNames = []) => {
  const modals = {}

  modalNames.forEach((name) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    modals[name] = useModal()
  })

  return modals
}
