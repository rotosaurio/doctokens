import { useState } from 'react';
import Head from 'next/head'
import { useStorageUpload } from "@thirdweb-dev/react";

export default function Home() {
  const [imageSrc, setImageSrc] = useState();
  const [uploadData, setUploadData] = useState();
 
  const [uploadUrl, setUploadUrl] = useState(null);
  const [url, setUrl] = useState(null);
  const [statusText, setStatusText] = useState("");

  function handleOnChange(changeEvent) {
    const reader = new FileReader();

    reader.onload = function(onLoadEvent) {
      setImageSrc(onLoadEvent.target.result);
      setUploadData(undefined);
    }
  

    

  async function handleOnSubmit(event) {
    event.preventDefault();

    const form = event.currentTarget;
    const fileInput = Array.from(form.elements).find(({ name }) => name === 'file');

    const formData = new FormData();

    for ( const file of fileInput.files ) {
      formData.append('file', file);
    }

    formData.append('upload_preset', 'fn0l9xfi');

    const data = await fetch('https://api.cloudinary.com/v1_1/dxcpcbyum/image/upload', {
      method: 'POST',
      body: formData
    }).then(r => r.json());

    setImageSrc(data.secure_url);
    setUploadData(data);
  }

  return (
    <div className="container mx-auto px-4">
  <Head>
    <title>Image Uploader</title>
    <meta name="description" content="Upload your image to Cloudinary!" />
    <link rel="icon" href="/favicon.ico" />
  </Head>

  <main className="text-center">
    <h1 className="text-4xl font-bold text-purple-500">
      Image Uploader
    </h1>

    <p className="text-black-900">
      Upload your image to Cloudinary!
    </p>
    
      <div class="flex flex-col justify-between bg-gradient-to-b from-green-400 via-blue-500 to-purple-500 h-screen p-10">
        <div class="flex justify-center items-center flex-grow">
          <img src="/12.png" alt="Descripción de la imagen"></img>
        </div>
        <div class="flex justify-center items-center space-x-4 mb-12">
          <button class="ease-in duration-350 bg-pink-400 shadow-lg shadow-pink-500/50 hover:scale-110 hover:bg-pink-500 text-white font-bold py-8 px-14 rounded-full text-lg
          flex justify-center items-center text-2xl">
            Upload file
             <img src="/18.png" alt="descripción" width={25} height={25}></img>
          </button>
          <button class="ease-in duration-350 bg-pink-400 shadow-lg shadow-pink-500/50 hover:scale-110 hover:bg-pink-500 text-white font-bold py-8 px-16 rounded-full text-lg 
          flex justify-center items-center text-2xl">
              <img src="/13.png" alt="descripción" width={25} height={25}></img>
            Dismiss
          </button>
        </div>
      </div>
  
  </main>
</div>
  )
}}