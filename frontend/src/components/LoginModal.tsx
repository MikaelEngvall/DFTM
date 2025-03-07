import { Fragment, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { FiMail, FiLock } from 'react-icons/fi'
import { useTranslation } from 'react-i18next'

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
  onLogin: (email: string, password: string) => Promise<void>
}

export const LoginModal = ({ isOpen, onClose, onLogin }: LoginModalProps) => {
  const { t } = useTranslation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)
    try {
      await onLogin(email, password)
    } catch (err) {
      setError(t('error.invalidCredentials'))
      console.error('Login error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/25 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-lg bg-card text-card-foreground dark:bg-[#1c2533] dark:text-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-xl font-semibold leading-6 mb-4"
                >
                  {t('loginModal.title')}
                </Dialog.Title>

                {error && (
                  <div className="mb-4 p-3 bg-destructive/10 border border-destructive text-destructive rounded">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-muted-foreground dark:text-gray-300">
                      {t('loginModal.email.label')}
                    </label>
                    <div className="mt-1 relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiMail className="h-5 w-5 text-muted-foreground dark:text-gray-400" />
                      </div>
                      <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2 border border-input rounded-md bg-background dark:bg-gray-700 dark:text-white placeholder-muted-foreground dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder={t('loginModal.email.placeholder')}
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-muted-foreground dark:text-gray-300">
                      {t('loginModal.password.label')}
                    </label>
                    <div className="mt-1 relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiLock className="h-5 w-5 text-muted-foreground dark:text-gray-400" />
                      </div>
                      <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2 border border-input rounded-md bg-background dark:bg-gray-700 dark:text-white placeholder-muted-foreground dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder={t('loginModal.password.placeholder')}
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <input
                        id="remember-me"
                        name="remember-me"
                        type="checkbox"
                        className="h-4 w-4 rounded border-input bg-background dark:border-gray-600 dark:bg-gray-700 text-primary focus:ring-primary dark:focus:ring-offset-gray-800"
                        disabled={isLoading}
                      />
                      <label htmlFor="remember-me" className="ml-2 block text-sm text-muted-foreground dark:text-gray-300">
                        {t('loginModal.rememberMe')}
                      </label>
                    </div>

                    <button
                      type="button"
                      className="text-sm font-medium text-primary hover:text-primary/80 dark:text-blue-400 dark:hover:text-blue-300"
                      disabled={isLoading}
                    >
                      {t('loginModal.forgotPassword')}
                    </button>
                  </div>

                  <div className="mt-6">
                    <button
                      type="submit"
                      className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-500"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-foreground mr-2"></div>
                          {t('loginModal.loading')}
                        </div>
                      ) : (
                        t('loginModal.submit')
                      )}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
} 