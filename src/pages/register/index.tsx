import { Link, useNavigate } from 'react-router-dom'
import LogoImg from '../../assets/logo.svg'
import { Container } from '../../components/container'
import { Input } from '../../components/input'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { auth } from '../../services/firebaseConnection'
import { createUserWithEmailAndPassword, signOut, updateProfile } from 'firebase/auth'
import { useContext, useEffect } from 'react'
import { AuthContext } from '../../contents/AuthContext'
import toast from 'react-hot-toast'

const schema = z.object({
  name: z.string().nonempty("O campo nome é obrigatório."),
  email: z.string().email("Insira um email válido").nonempty("O campo email é obrigatório."),
  password: z.string().min(6, ("A senha deve ter pelomenos 6 caracteres.")).nonempty("O campo senha é obrigatório.")
})

type FormData = z.infer<typeof schema>

export function Register() {
  const { handleInfoUser } = useContext(AuthContext)
  const navigate = useNavigate()

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: "onChange"
  })

  useEffect(() => {
    async function handleLogout() {
      await signOut(auth)
    }

    handleLogout()
  }, [])

  async function onSubmit(data: FormData){
    
    createUserWithEmailAndPassword(auth, data.email, data.password)
      .then(async (user) => {
        await updateProfile(user.user, {
          displayName: data.name
        })

        handleInfoUser({
          name: data.name,
          email: data.email,
          uid: user.user.uid
        })
        console.log("Cadastrado com sucesso")
        toast.success("Bem vindo ao Web Carros", {
          style: {
            borderRadius: '10px',
            background: '#333',
            color: '#fff',
          },
        })
        navigate("/dashboard", {replace: true})
      })
      .catch((error) => {
        console.log("Erro ao Cadastrar o user")
        console.log(error)
        toast.error("Erro ao cadastrar", {
          style: {
            borderRadius: '10px',
            background: '#333',
            color: '#fff',
          },
        })
      })

  }

  return (
    <Container>
      <div className='w-full min-h-screen flex justify-center items-center flex-col gap-4'>
      <img
          className='mb-6 max-w-sm w-full'
          src={LogoImg}
          alt='Logo do Site'
        />

        <form
         className='bg-white max-w-xl w-full rounded-lg p-4'
         onSubmit={handleSubmit(onSubmit)}
         >
          <div className='mb-3'>
            <Input
              type="text"
              placeholder="Digite seu nome Completo..."
              name= "name"
              error={errors.name?.message}
              register={register}
            />
          </div>
          <div className='mb-3'>
            <Input
              type="email"
              placeholder="Digite seu email..."
              name= "email"
              error={errors.email?.message}
              register={register}
            />
          </div>
          <div className='mb-3'>
            <Input
              type="password"
              placeholder="Digite sua Senha..."
              name= "password"
              error={errors.password?.message}
              register={register}
            />
          </div>

          <button type='submit' className='bg-zinc-900 w-full text-white h-10 font-medium rounded-md'>
            Cadastrar
          </button>

        </form>

        <Link to={"/login"} className='text-white'>Já possui uma conta? Vá para o login.</Link>

      </div>
    </Container>
  )
}