import { FiTrash, FiUpload } from "react-icons/fi";
import { Container } from "../../../components/container";
import { DashboardHeader } from "../../../components/panelHeader";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "../../../components/input";
import { ChangeEvent, useContext, useState } from "react";
import { AuthContext } from "../../../contents/AuthContext";

import {v4 as uuidV4} from 'uuid'
import { deleteObject, getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { db, storage } from "../../../services/firebaseConnection";
import { addDoc, collection } from "firebase/firestore";
import toast from "react-hot-toast";

const schema = z.object({
  name: z.string().nonempty("O campo nome é obrigatório."),
  model: z.string().nonempty("O campo modelo é obrigatório."),
  year: z.string().nonempty("O ano do carro é obrigatório."),
  kmRodado: z.string().nonempty("Quilometragem obrigatória."),
  valor: z.string().nonempty("O campo valor do carro é obrigatório."),
  cidade: z.string().nonempty("O campo Cidade é obrigatório."),
  whatsapp: z.string().nonempty("O campo telefone é obrigatório.").refine((value) => /^(\d{11,12})$/.test(value), {
    message: "Número de telefone inválido."
  }),
  descricao: z.string().nonempty("O campo descrição é obrigatório."),
})

type FormData = z.infer<typeof schema>

interface ImageItemProps {
  uid: string;
  name: string;
  previewURL: string;
  url: string;
}

export function New() {
  const { user } = useContext(AuthContext)

  const {register, handleSubmit, formState: {errors}, reset} = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: "onChange"
  })

  const [carImage, setCarImages] = useState<ImageItemProps[]>([])

  function onSubmit(data: FormData) {
    
    if(carImage.length === 0){
      toast.error("Envie pelo menos uma imagem.",{
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        },
      });
      return;
    }

    const carListImages = carImage.map(car => {
      return{
        uid: car.uid,
        name: car.name,
        url: car.url
      }
    })

    addDoc(collection(db, "cars"), {
      name: data.name.toUpperCase(),
      model: data.model,
      whatsapp: data.whatsapp,
      cidade: data.cidade,
      year: data.year,
      kmRodado: data.kmRodado,
      valor: data.valor,
      descricao: data.descricao,
      created: new Date(),
      owner: user?.name,
      uid: user?.uid,
      images: carListImages
    })
    .then(() => {
      reset();
      setCarImages([])
      toast.success("Carro cadastrado com sucesso", {
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        },
      });
    })
    .catch((error) => {
      console.log(error + "Erro ao cadastrar no banco")
    })

  }

  async function handleFile(e: ChangeEvent<HTMLInputElement>){
    if(e.target.files && e.target.files[0]){
      const image = e.target.files[0]

      if(image.type === 'image/jpeg' || image.type === 'image/png'){
        //Enviar a imagem para o banco
        await handleUpload(image)
        console.log(image)
      } else {
        alert("Envia uma imagem jpeg ou png")
        return;
      }
    }
  }

  async function handleUpload(image: File) {
    if(!user?.uid){
      return;
    }

    const currentUuid = user?.uid
    const uidImage = uuidV4();

    const uploadRef = ref(storage, `images/${currentUuid}/${uidImage}`);

    uploadBytes(uploadRef, image)
    .then((snapshot) => {
      getDownloadURL(snapshot.ref).then((downloadUrl) => {
        const imageItem = {
          name: uidImage,
          uid: currentUuid,
          previewURL: URL.createObjectURL(image),
          url: downloadUrl,
        }
        toast.success("Imagem cadastrado com sucesso", {
          style: {
            borderRadius: '10px',
            background: '#333',
            color: '#fff',
          },
        });
        setCarImages((images) => [...images, imageItem])
      })
    })

  }

  async function handleDeleteImage(item: ImageItemProps){
    const imagePath = `images/${item.uid}/${item.name}`

    const imageRef = ref(storage, imagePath);

    try{
      await deleteObject(imageRef)
      setCarImages(carImage.filter((car) => car.url !== item.url))
      toast.success("Imagem deletada.", {
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        },
      })
    }
    catch(err){
      console.log("Erro ao deletar");
      toast.error("Erro ao deletar imagem", {
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        },
      })
    }
  }

  return (
    <Container>
      <DashboardHeader />

      <div className="w-full bg-zinc-800 p-3 rounded-lg flex flex-col sm:flex-row items-center gap-2">
        <button className="border-2 w-48 rounded-lg flex items-center justify-center cursor-pointer border-gray-600 h-32 md:w-48">
          <div className="absolute cursor-pointer">
            <FiUpload size={30} color="#fff"/>
          </div>
          <div className="cursor-pointer">
            <input
             className="opacity-0 cursor-pointer"
             type="file" 
             accept="image/*"
             onChange={handleFile}
             />
          </div>
        </button>

        {carImage.map(item => (
          <div key={item.name} className="w-full h-32 flex items-start justify-end relative">
            <button className="absolute" onClick={() => handleDeleteImage(item)}>
              <FiTrash size={28} color="#fff"/>
            </button>
            <img
              src={item.previewURL}
              className="rounded-lg w-full h-32 object-cover"
              alt="Foto do carro"
            />
          </div>
        ))}
      </div>

      <div className="w-full bg-zinc-800 p-3 rounded-lg flex flex-col sm:flex-rol items-center gap-2 mt-2 mb-10">
        <form
         className="w-full"
         onSubmit={handleSubmit(onSubmit)}
         >
          <div className="mb-3">
            <p className="mb-2 font-medium text-white">
              Nome do Carro
            </p>
            <Input
              type="text"
              register={register}
              name="name"
              error={errors.name?.message}
              placeholder="Exemplo Onix 1.0"
            />
          </div>
          <div className="mb-3">
            <p className="mb-2 font-medium text-white">
              Modelo
            </p>
            <Input
              type="text"
              register={register}
              name="model"
              error={errors.model?.message}
              placeholder="Exemplo: 1.0 flex, manual"
            />
          </div>

          <div className=" w-full flex gap-x-7">
            <div className="w-6/12 mb-3">
              <p className="mb-2 font-medium text-white">
                Ano
              </p>
              <Input
                type="text"
                register={register}
                name="year"
                error={errors.year?.message}
                placeholder="Exemplo: 2020"
              />
            </div>
            <div className="w-6/12 mb-3">
              <p className="mb-2 font-medium text-white">
                Km Rodado
              </p>
              <Input
                type="text"
                register={register}
                name="kmRodado"
                error={errors.kmRodado?.message}
                placeholder="Exemplo: 100.000"
              />
            </div>
          </div>

          <div className="mb-3">
            <p className="mb-2 font-medium text-white">
              Valor em R$
            </p>
            <Input
              type="text"
              register={register}
              name="valor"
              error={errors.valor?.message}
              placeholder="Exemplo: R$100.000"
            />
          </div>

          <div className="mb-3">
            <p className="mb-2 font-medium text-white">
              Cidade
            </p>
            <Input
              type="text"
              register={register}
              name="cidade"
              error={errors.cidade?.message}
              placeholder="Exemplo: Uberlândia-MG"
            />
          </div>

          <div className="mb-3">
            <p className="mb-2 font-medium text-white">
              Whatsapp
            </p>
            <Input
              type="text"
              register={register}
              name="whatsapp"
              error={errors.whatsapp?.message}
              placeholder="Exemplo: (99) 9 9999-9999"
            />
          </div>

          <div className="mb-3">
            <p className="mb-2 font-medium text-white">
              Descrição
            </p>
            <textarea
              className="border-2 rounded-md h-24 w-full px-2"
              {...register("descricao")}
              name="descricao"
              id="descricao"
              placeholder="Digite a descrição completa sobre o carro"
            />
            {errors.descricao && <p className="mb-1 text-red-500">{errors.descricao.message}</p>}
          </div>

          <button
            type="submit"
            className="w-full h-10 rounded-md bg-zinc-900 text-white font-medium"
          >
            Cadastrar
          </button>

        </form>
      </div>
    </Container>
  )
}