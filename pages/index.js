import toast, { Toaster } from "react-hot-toast";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
    Connection,
    SystemProgram,
    Transaction,
    PublicKey,
    LAMPORTS_PER_SOL,
    clusterApiUrl,
    SendTransactionError,
} from "@solana/web3.js";
import { useStorageUpload } from "@thirdweb-dev/react";


import axios from "axios";

const SOLANA_NETWORK = "devnet";
const Home = () => {
  const receiver = "4ANfnFkUp7pJRoPqpM2VdqNbrW7L8Riws9Mc6S2VUHJ9";
  const [amount, setAmount] = useState(0);
  const [balance, setBalance] = useState(0);
  const router = useRouter();
  const [publicKey,setPublicKey] = useState(null);

  const [uploadUrl, setUploadUrl] = useState(null);
  const [url, setUrl] = useState(null);
  const [statusText, setStatusText] = useState("");

  useEffect(() => {
    let key = window.localStorage.getItem("publicKey"); //obtiene la publicKey del localStorage
        setPublicKey(key);
        if (key) {
            getBalances(key);
        }
  } ,[]);
  const handleReceiverChange = (event) => {
    setReceiver(event.target.value);
    console.log("receiver", receiver);
  }
  const handleAmountChange = (event) => {
    setAmount(event.target.value);
    console.log("amount", amount);
  }
  const handleURLChange = (event) => {
    setUrl(event.target.value);
    console.log("Si se esta seteando la URL", url);
  };
  const handleSubmit = async () => {

    console.log("amount", amount);
    sendTransaction();}
  const signIn = async () => {
    //Si phantom no esta instalado
    const provider = window?.phantom?.solana;
    const { solana } = window;

    if (!provider?.isPhantom || !solana.isPhantom) {
        toast.error("Phantom no esta instalado");
        setTimeout(() => {
            window.open("https://phantom.app/", "_blank");
        }, 2000);
        return;
    }
    //si tienes phantom instalado
    let phantom;
        if (provider?.isPhantom) phantom = provider;

        const { publicKey } = await phantom.connect(); //conecta a phantom
        console.log("publicKey", publicKey.toString()); //muestra la publicKey
        setPublicKey(publicKey.toString()); //guarda la publicKey en el state
        window.localStorage.setItem("publicKey", publicKey.toString()); //guarda la publicKey en el localStorage

        toast.success("Tu Wallet esta conectada 👻");

        getBalances(publicKey);
    };
    const signOut = async () => {
      if (window) {
          const { solana } = window;
          window.localStorage.removeItem("publicKey");
          setPublicKey(null);
          solana.disconnect();
          router.reload(window?.location?.pathname);
      }
  };

//funcion para el balance de la wallet

const getBalances = async (publicKey) => {
  try {
      const connection = new Connection(
          clusterApiUrl(SOLANA_NETWORK),
          "confirmed"
      );

      const balance = await connection.getBalance(
          new PublicKey(publicKey)
      );

      const balancenew = balance / LAMPORTS_PER_SOL;
      setBalance(balancenew);
  } catch (error) {
      console.error("ERROR GET BALANCE", error);
      toast.error("Something went wrong getting the balance");
  }
};
const sendTransaction = async () => {
  console.log("sendTransaction");
  try {
      //Consultar el balance de la wallet
      getBalances(publicKey);
      console.log("Este es el balance", balance);

      //Si el balance es menor al monto a enviar
      if (balance < amount) {
          toast.error("No tienes suficiente balance");
          return;
      }

      const provider = window?.phantom?.solana;
      const connection = new Connection(
          clusterApiUrl(SOLANA_NETWORK),
          "confirmed"
      );
     

      //Llaves

      const fromPubkey = new PublicKey(publicKey);
      const toPubkey = new PublicKey(receiver);

      //Creamos la transaccion
      const transaction = new Transaction().add(
          SystemProgram.transfer({
              fromPubkey,
              toPubkey,
              lamports: amount * LAMPORTS_PER_SOL,
          })
      );
      console.log("Esta es la transaccion", transaction);

      //Traemos el ultimo blocke de hash
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = fromPubkey;

      //Firmamos la transaccion
      const transactionsignature = await provider.signTransaction(
          transaction
      );

      //Enviamos la transaccion
      const txid = await connection.sendRawTransaction(
          transactionsignature.serialize()
      );
      console.info(`Transaccion con numero de id ${txid} enviada`);

      //Esperamos a que se confirme la transaccion
      const confirmation = await connection.confirmTransaction(txid, {
          commitment: "singleGossip",
      });

      const { slot } = confirmation.value;

      console.info(
          `Transaccion con numero de id ${txid} confirmado en el bloque ${slot}`
      );

      const solanaExplorerLink = `https://explorer.solana.com/tx/${txid}?cluster=${SOLANA_NETWORK}`;
      setExplorerLink(solanaExplorerLink);

      toast.success("Transaccion enviada con exito :D ");

      //Actualizamos el balance
      getBalances(publicKey);
      setAmount(null);
      setReceiver(null);

      return solanaExplorerLink;
  } catch (error) {
      console.error("ERROR SEND TRANSACTION", error);
      toast.error("Error al enviar la transaccion");
  }
};
const generateNFT = async () => {
  try {
    setStatusText("Generando NFT...");
    const mintedData = {name : "nftgeneradopordoctokens",
    imagenUrl : url,
    publicKey,};
    console.log("mintedData", mintedData);
    setStatusText("se esta generando tu nft en solana espera porfavor");
    const { data } = await axios.post("/api/mintnft", mintedData);
    const { signature: newSignature } = data;
    const solanaExplorerUrl = `https://solscan.io/tx/${newSignature}?cluster=${SOLANA_NETWORK}`;
    console.log("solanaExplorerUrl", solanaExplorerUrl);
    setStatusText(
        "¡Listo! Tu NFT se a creado, revisa tu Phantom Wallet 🖖"
    );
} catch (error) {
    console.error("ERROR GENERATE NFT", error);
    toast.error("Error al generar el NFT");
}
};

return (
  <>
  {publicKey ? ( <><div className="min-h-screen bg-gradient-to-r from-purple-400 via-blue-500 to-green-400 flex flex-col items-center justify-center text-white">
  <p className="text-center">Tu wallet esta conectado con la clave publica: {publicKey}</p>
  <h1 className="mt-4">Tu balance en phantom es de {balance} SOL</h1>
  
  <h1 className="text-2xl mt-4">Donaciones</h1>
  <input 
    className="h-8 w-72 mt-4 bg-white text-black"
    type="text"
    onChange={handleAmountChange}
  />
  <button className="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded mx-auto block mt-4" onClick={handleSubmit}>
    Transferir
  </button>
  <h1 className="text-2xl mt-4">URL de la imagen</h1>
  <input 
    className="h-8 w-72 mt-4 bg-white text-black"
    type="text"
    onChange={handleURLChange}
  />
  <button
    className="inline-flex h-8 w-52 justify-center bg-blue-500 hover:bg-blue-700 font-bold text-white mt-4"
    onClick={() => {
      generateNFT();
      console.log("Se esta generando el NFT");
    }}
  >
    Crear NFT 🔥
  </button>
  <button className="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded mx-auto block mt-4" onClick={signOut}>
    Cerrar sesion
  </button>
</div>
  </>
  
  ) :(
    <div className="bg-gradient-to-r from-emerald-300 via-fuchsia-300 to-fuchsia-400 pl-12 h-screen"> 
    <div className="flex flex-row items-center">
      <img className="pt-5 p-1 w-34 h-32" src="/Logo.png" />
      <div className="pr-168">
        <div className="text-black text-4xl mb-6">
          DOCTOKENS
        </div>
      </div>
    </div>
    <br/>
    <div className="flex justify-between">
      <div>
        <h1 className="text-black text-3xl"> A project that can easily transform <br/>documents to nft for a small amount through<br/> the solana network </h1>       <br/>
        <button className="bg-gradient-to-r from-purple-300 via-purple-300 to-purple-300 text-purple font-bold py-2 px-4 rounded ml-2" onClick={signIn} >
          Connect your wallet
        </button>
        <br/>
        <label className="flex items-center space-x-3">
          <input type="checkbox" className="form-checkbox h-5 w-5 text-blue-600" />
          <br/>
          <br/><a href="/tyc">
          <span className="text-gray-700">Acepto términos y condiciones
          
          </span></a>
          <br/>
          <br/>
        </label>
        <h1 className="text-black"> Sign up as guest</h1> 
        <br/>
        <div>
          <input className="border-2 border-gray-300 p-2 rounded-md text-center" type="text" placeholder="Name" />
        </div>
        <div>
          <input className="border-2 border-gray-300 p-2 rounded-md text-center" type="text" placeholder="E-mail" />
        </div>
        <br/>
        <button className="bg-gradient-to-r from-purple-300 via-purple-300 to-purple-300 text-purple font-bold py-2 px-4 rounded text text pr-5 ml-12">
          Submit
        </button>
      </div>
      <img className="w-120 h-120 pt-[-60] mr-72" src="/gato.png" />
    </div>
  </div>)} </>
);};
export default Home;