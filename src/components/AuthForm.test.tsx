import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import AuthForm from './AuthForm'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

// Mock next-auth/react
jest.mock('next-auth/react', () => ({
  signIn: jest.fn(),
}))

describe('AuthForm Component', () => {
  const mockRouter = {
    push: jest.fn(),
    refresh: jest.fn(),
  }

  beforeEach(() => {
    ;(useRouter as jest.Mock).mockReturnValue(mockRouter)
  })

  const mockDict = {
    auth: {
      login: { title: 'Welcome Back', description: 'Log in to your account', button: 'LOG IN', noAccount: "Don't have an account?", registerLink: 'Register now' },
      register: { title: 'Create Account', description: 'Fill your details', button: 'REGISTER', hasAccount: 'Already have an account?', loginLink: 'Log in here' },
      fields: { firstName: 'First Name', lastName: 'Last Name', username: 'Username', email: 'Email', password: 'Password' }
    }
  }

  it('renders login form correctly', () => {
    render(<AuthForm type="login" dict={mockDict} lang="en" />)
    expect(screen.getByText('Welcome Back')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('m@example.com')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /LOG IN/i })).toBeInTheDocument()
  })

  it('renders register form correctly', () => {
    render(<AuthForm type="register" dict={mockDict} lang="en" />)
    expect(screen.getByText('Create Account')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('John')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Doe')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /REGISTER/i })).toBeInTheDocument()
  })

  it('performs login successfully', async () => {
    ;(signIn as jest.Mock).mockResolvedValue({ error: null })
    render(<AuthForm type="login" dict={mockDict} lang="en" />)

    fireEvent.change(screen.getByPlaceholderText('m@example.com'), {
      target: { name: 'email', value: 'test@example.com' },
    })
    fireEvent.change(screen.getByPlaceholderText('••••••••'), {
      target: { name: 'password', value: 'password123' },
    })

    fireEvent.click(screen.getByRole('button', { name: /LOG IN/i }))

    await waitFor(() => {
      expect(signIn).toHaveBeenCalledWith('credentials', expect.any(Object))
      expect(mockRouter.push).toHaveBeenCalledWith('/en/dashboard')
    })
  })
})
