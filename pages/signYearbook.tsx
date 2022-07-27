//@ts-nocheck

import { useState, useRef } from 'react'
import { MainContext } from '../context'
import { css } from '@emotion/css'
import Select from 'react-select'
import { useContract } from "wagmi";
import abi from "../abi.json";
import { providers, utils } from "ethers";
import { WebBundlr } from "@bundlr-network/client"
import { APP_NAME } from '../utils'
import { useRouter } from 'next/router'


// list of supported currencies: https://docs.bundlr.network/docs/currencies
const supportedCurrencies = {
  matic: 'matic',
  ethereum: 'ethereum',
  avalanche: 'avalanche',
  bnb: 'bnb',
  arbitrum: 'arbitrum'
}


const CONTRACT_ADDRESS = "0x64e52D33C3826828f929fC7Ee00aD17f52844F1F";

const currencyOptions = Object.keys(supportedCurrencies).map(v => {
  return {
    value: v, label: v
  }
})

export default function Profile() {
    const contract = useContract({
        addressOrName: CONTRACT_ADDRESS,
        contractInterface: abi.abi,
      });
    
      const [title, setTitle] = useState("");
      const [name, setName] = useState("");
      const [timestamp, setTimestmap] = useState("");
      // TODO: create state for img and handle image upload
      const [friends, setFriends] = useState([]);
    
      const [image, setImage] = useState("");
      const [createObjectURL, setCreateObjectURL] = useState("");
    
      const [message, setMessage] = useState("");
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
    </div>
  )
}
const selectContainerStyle = css`
  margin: 10px 0px 20px;
`

const containerStyle = css`
  padding: 10px 20px;
  display: flex;
  justify-content: center;
`

const buttonStyle = css`
  background-color: black;
  color: white;
  padding: 12px 40px;
  border-radius: 50px;
  font-weight: 700;
  width: 180;
  transition: all .35s;
  cursor: pointer;
  &:hover {
    background-color: rgba(0, 0, 0, .75);
  }
`

const wideButtonStyle = css`
  ${buttonStyle};
  width: 380px;
`

const balanceStyle = css`
  padding: 10px 25px;
  background-color: rgba(0, 0, 0, .08);
  border-radius: 30px;
  display: inline-block;
  width: 200px;
  text-align: center;
`

const navHeight = 80
const footerHeight = 70

const navStyle = css`
  height: ${navHeight}px;
  padding: 40px 100px;
  border-bottom: 1px solid #ededed;
  display: flex;
  align-items: center;
`

const homeLinkStyle = css`
  display: flex;
  flex-direction: row;
  align-items: center;
`

const homeLinkTextStyle = css`
  font-weight: 200;
  font-size: 28;
  letter-spacing: 7px;
`

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
`

