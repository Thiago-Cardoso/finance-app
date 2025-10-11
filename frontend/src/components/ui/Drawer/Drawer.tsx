'use client'

import { Dialog, Transition } from '@headlessui/react'
import { Fragment } from 'react'
import { X } from 'lucide-react'

interface DrawerProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  position?: 'left' | 'right' | 'bottom'
}

export function Drawer({
  isOpen,
  onClose,
  title,
  children,
  position = 'bottom'
}: DrawerProps) {
  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog onClose={onClose} className="relative z-50">
        {/* Backdrop */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />
        </Transition.Child>

        {/* Drawer Panel */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom={position === 'bottom' ? 'translate-y-full' : position === 'left' ? '-translate-x-full' : 'translate-x-full'}
          enterTo="translate-y-0 translate-x-0"
          leave="ease-in duration-200"
          leaveFrom="translate-y-0 translate-x-0"
          leaveTo={position === 'bottom' ? 'translate-y-full' : position === 'left' ? '-translate-x-full' : 'translate-x-full'}
        >
          <Dialog.Panel className={`fixed ${
            position === 'bottom'
              ? 'bottom-0 left-0 right-0 rounded-t-2xl max-h-[85vh]'
              : position === 'left'
              ? 'top-0 left-0 bottom-0 w-80 rounded-r-2xl'
              : 'top-0 right-0 bottom-0 w-80 rounded-l-2xl'
          } bg-white dark:bg-gray-800 shadow-2xl overflow-hidden flex flex-col`}>
            {/* Header */}
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex justify-between items-center z-10">
              <Dialog.Title className="text-lg font-bold text-gray-900 dark:text-gray-100">
                {title}
              </Dialog.Title>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Close drawer"
              >
                <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {children}
            </div>
          </Dialog.Panel>
        </Transition.Child>
      </Dialog>
    </Transition>
  )
}
