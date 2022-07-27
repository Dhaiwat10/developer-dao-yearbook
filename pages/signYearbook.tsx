//@ts-nocheck

import { useState, useRef } from "react";
import { MainContext } from "../context";
import { css } from "@emotion/css";
import Select from "react-select";
import { useContract } from "wagmi";
import abi from "../abi.json";
import { providers, utils } from "ethers";
import { WebBundlr } from "@bundlr-network/client";
import { APP_NAME } from "../utils";
import { useRouter } from "next/router";

// list of supported currencies: https://docs.bundlr.network/docs/currencies
const supportedCurrencies = {
  matic: "matic",
  ethereum: "ethereum",
  avalanche: "avalanche",
  bnb: "bnb",
  arbitrum: "arbitrum",
};

const CONTRACT_ADDRESS = "0x64e52D33C3826828f929fC7Ee00aD17f52844F1F";

const currencyOptions = Object.keys(supportedCurrencies).map((v) => {
  return {
    value: v,
    label: v,
  };
});

export default function SignYearbook() {
  const contract = useContract({
    addressOrName: CONTRACT_ADDRESS,
    contractInterface: abi.abi,
  });
  //contract.Functioncall()

  const [file, setFile] = useState()
  const [localVideo, setLocalVideo] = useState()
  const [fileCost, setFileCost] = useState()
  const [URI, setURI] = useState()
  const [title, setTitle] = useState("");
  const [name, setName] = useState("");
  const [timestamp, setTimestmap] = useState("");
  const [friends, setFriends] = useState([]);

  const [description, setDescription] = useState('')
  const [bundlrInstance, setBundlrInstance] = useState();
  const [balance, setBalance] = useState(0);

  // set the base currency as matic (this can be changed later in the app)
  const [currency, setCurrency] = useState("matic");
  const bundlrRef = useRef();

  // create a function to connect to bundlr network
  async function initialiseBundlr() {
    await window.ethereum.enable();

    const provider = new providers.Web3Provider(window.ethereum);
    await provider._ready();

    const bundlr = new WebBundlr(
      "https://node1.bundlr.network",
      currency,
      provider
    );
    await bundlr.ready();

    setBundlrInstance(bundlr);
    bundlrRef.current = bundlr;
    fetchBalance();
  }

  // get the user's bundlr balance
  async function fetchBalance() {
    const bal = await bundlrRef.current.getLoadedBalance();
    console.log("bal: ", utils.formatEther(bal.toString()));
    setBalance(utils.formatEther(bal.toString()));
  }

  // if the user has not initialized bundlr, allow them to
  if (!bundlrInstance) {
    return (
      <div>
        <div className={selectContainerStyle}>
          <Select
            onChange={({ value }) => setCurrency(value)}
            options={currencyOptions}
            defaultValue={{ value: currency, label: currency }}
            classNamePrefix="select"
            instanceId="currency"
          />
          <p>Currency: {currency}</p>
        </div>
        <div className={containerStyle}>
          <button className={wideButtonStyle} onClick={initialiseBundlr}>
            Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  // router will allow us to programatically route after file upload
  const router = useRouter()

  // when the file is uploaded, save to local state and calculate cost
  function onFileChange(e) {
    const file = e.target.files[0]
    if (!file) return
    checkUploadCost(file.size)
    if (file) {
      const video = URL.createObjectURL(file)
      setLocalVideo(video)
      let reader = new FileReader()
      reader.onload = function (e) {
        if (reader.result) {
          setFile(Buffer.from(reader.result))
        }
      }
      reader.readAsArrayBuffer(file)
    }
  }


  // save the video to Arweave
  async function uploadFile() {
    if (!file) return
    const tags = [{ name: 'Content-Type', value: 'image/jpeg' }]
    try {
      let tx = await bundlrInstance.uploader.upload(file, tags)
      setURI(`http://arweave.net/${tx.data.id}`)
    } catch (err) {
      console.log('Error uploading video: ', err)
    }
  }

  async function checkUploadCost(bytes) {
    if (bytes) {
      const cost = await bundlrInstance.getPrice(bytes)
      setFileCost(utils.formatEther(cost.toString()))
    }
  }

   // save the video and metadata to Arweave
   async function saveVideo() {
    if (!file || !title || !description) return
    const tags = [
      { name: 'Content-Type', value: 'text/plain' },
      { name: 'App-Name', value: APP_NAME }
    ]

    const video = {
      title,
      description,
      URI,
      createdAt: new Date(),
      createdBy: bundlrInstance.address,
    }

    try {
      let tx = await bundlrInstance.createTransaction(JSON.stringify(video), { tags })
      await tx.sign()
      const { data } = await tx.upload()

      console.log(`http://arweave.net/${data.id}`)
      setTimeout(() => {
        router.push('/')
      }, 2000)
    } catch (err) {
      console.log('error uploading video with metadata: ', err)
    }
  }

  if (!bundlrInstance) {
    return  (
      <div>
        <div className={selectContainerStyle} >
          <Select
            onChange={({ value }) => setCurrency(value)}
            options={currencyOptions}
            defaultValue={{ value: currency, label: currency }}
            classNamePrefix="select"
            instanceId="currency"
          />
          <p>Currency: {currency}</p>
        </div>
      <div className={containerStyle}>
        <button className={wideButtonStyle} onClick={initialiseBundlr}>Connect Wallet</button>
      </div>
      </div>
     )
   }





  // once the user has initialized Bundlr, show them their balance
  return (
    <div>
      <h3 className={balanceStyle}>💰 Balance {Math.round(balance * 100) / 100}</h3>
      <div className={formStyle}>
        <p className={labelStyle}>Upload Image</p>
        <div className={inputContainerStyle}>
          <input
            type="file"
            onChange={onFileChange}
          />
        </div>
        { /* if there is a video save to local state, display it */}
        {
          localVideo && (
            <img key={localVideo} width="520" controls className={videoStyle}
            src={localVideo}/>
            
          )
        }
        {/* display calculated upload cast */}
        {
          fileCost && <h4>Cost to upload: {Math.round((fileCost) * 1000) / 1000} MATIC</h4>
        }
        <button className={buttonStyle} onClick={uploadFile}>Upload Video</button>
        {/* if there is a URI, then show the form to upload it */}
        {
          URI && (
            <div>
               <p className={linkStyle} >
                <a target="_blank" rel="noopener noreferrer" href={URI}>{URI}</a>
               </p>
               <div className={formStyle}>
                 <p className={labelStyle}>Title</p>
                 <input className={inputStyle} onChange={e => setTitle(e.target.value)} placeholder='Video title' />
                 <p className={labelStyle}>Description</p>
                 <textarea placeholder='Video description' onChange={e => setDescription(e.target.value)} className={textAreaStyle}  />
                 <button className={saveVideoButtonStyle} onClick={saveVideo}>Save Video</button>
               </div>
            </div>
          )
        }
      </div>
    </div>
  )
}
const selectContainerStyle = css`
  margin: 10px 0px 20px;
`;

const containerStyle = css`
  padding: 10px 20px;
  display: flex;
  justify-content: center;
`;

const buttonStyle = css`
  background-color: black;
  color: white;
  padding: 12px 40px;
  border-radius: 50px;
  font-weight: 700;
  width: 180;
  transition: all 0.35s;
  cursor: pointer;
  &:hover {
    background-color: rgba(0, 0, 0, 0.75);
  }
`;

const wideButtonStyle = css`
  ${buttonStyle};
  width: 380px;
`;

const balanceStyle = css`
  padding: 10px 25px;
  background-color: rgba(0, 0, 0, 0.08);
  border-radius: 30px;
  display: inline-block;
  width: 200px;
  text-align: center;
`;

const navHeight = 80;
const footerHeight = 70;

const navStyle = css`
  height: ${navHeight}px;
  padding: 40px 100px;
  border-bottom: 1px solid #ededed;
  display: flex;
  align-items: center;
`;

const homeLinkStyle = css`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const homeLinkTextStyle = css`
  font-weight: 200;
  font-size: 28;
  letter-spacing: 7px;
`;

const footerStyle = css`
  border-top: 1px solid #ededed;
  height: ${footerHeight}px;
  padding: 0px 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 200;
  letter-spacing: 1px;
  font-size: 14px;
`;







// New Styles
const linkStyle = css`
  margin: 15px 0px;
`

const inputContainerStyle = css`
  margin: 0px 0px 15px;
`

const videoStyle = css`
  margin-bottom: 20px;
`

const formStyle = css`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 20px 0px 0px;
`

const labelStyle = css`
  margin: 0px 0px 5px;
`

const inputStyle = css`
  padding: 12px 20px;
  border-radius: 5px;
  border: none;
  outline: none;
  background-color: rgba(0, 0, 0, .08);
  margin-bottom: 15px;
`

const textAreaStyle = css`
  ${inputStyle};
  width: 350px;
  height: 90px;
`

const saveVideoButtonStyle = css`
  ${buttonStyle};
  margin-top: 15px;
`
