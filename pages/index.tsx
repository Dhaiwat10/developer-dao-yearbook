//@ts-nocheck
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useContract } from "wagmi";
import abi from "../abi.json";
import { TagsInput } from "react-tag-input-component";
import { WebBundlr } from "@bundlr-network/client";
import { useState, useRef, useEffect, useContext } from "react";
import { providers, utils } from "ethers";
import { css } from "@emotion/css";
import Link from "next/link";
import { query, arweave, createVideoMeta, createPostInfo } from '../utils'
import LitJsSdk from 'lit-js-sdk'
import { MainContext } from '../context'
import Cookies from 'js-cookie'

//todo:
//call the smart contract function in the same function that saves the video to arweave
//add fund your bundlr wallet to the homepage
//styling
//invite David from lit to our next pairing session to walk us through setting up lit protocol so that only people who hold x token can sign this yearbook


const CONTRACT_ADDRESS = "0x64e52D33C3826828f929fC7Ee00aD17f52844F1F";
const accessControlConditions = [
  {
    contractAddress: '0x25ed58c027921E14D86380eA2646E3a1B5C55A8b',
    standardContractType: 'ERC721',
    chain: 'ethereum',
    method: 'balanceOf',
    parameters: [
      ':userAddress'
    ],
    returnValueTest: {
      comparator: '>',
      value: '0'
    }
  }
]

// basic exponential backoff in case of gateway timeout / error
const wait = (ms) => new Promise((res) => setTimeout(res, ms))

export default function Home() {
  const [images, setImages] = useState([])
  const [connected, setConnected] = useState()
  const { id } = useContext(MainContext)

  async function connect() {
    const resourceId = {
      baseUrl: 'http://localhost:3000',
      path: '/protected',
      orgId: "",
      role: "",
      extraData: id
    }

    const client = new LitJsSdk.LitNodeClient({ alertWhenUnauthorized: false })
    await client.connect()
    const authSig = await LitJsSdk.checkAndSignAuthMessage({chain: 'ethereum'})

    await client.saveSigningCondition({ accessControlConditions, chain: 'ethereum', authSig, resourceId })
    try {
      const jwt = await client.getSignedToken({
        accessControlConditions, chain: 'ethereum', authSig, resourceId: resourceId
      })
      Cookies.set('lit-auth', jwt, { expires: 1 })

    } catch (err) {
      console.log('error: ', err)
    }
    setConnected(true)

  }

  // when app loads, fetch images
  useEffect(() => {
    getPostInfo()
  }, [])

  // fetch data from Arweave
  // map over data and fetch metadata for each video then save to local state
  async function getPostInfo(topicFilter = null, depth = 0) {
    try {
      const results = await arweave.api.post('/graphql', query)
        .catch(err => {
          console.error('GraphQL query failed')
          throw new Error(err);
        });
      const edges = results.data.data.transactions.edges
      const posts = await Promise.all(
        edges.map(async edge => await createPostInfo(edge.node))
      )
      let sorted = posts.sort((a, b) => new Date(b.request.data.createdAt) - new Date(a.request.data.createdAt))
      sorted = sorted.map(s => s.request.data)
      setImages(sorted)
    } catch (err) {
      await wait(2 ** depth * 10)
      getPostInfo(topicFilter, depth + 1)
      console.log('error: ', err)
    }
  }

  return (
    <div className={containerStyle}>
       {
        !connected && <button onClick={connect}>Connect</button>
      }
      <Link href={`/signYearbook?id=${id}`}>
        <a>Navigate to protected page</a>
      </Link>
      {
        images.map(video => (
          <div className={videoContainerStyle} key={video.URI}>
            <img key={video.URI} width="720px" height="405" controls className={videoStyle} src={video.URI}/>
            <div className={titleContainerStyle}>
              <h3 className={titleStyle}>{video.name}</h3>
            </div>
            <p className={descriptionStyle}>{video.message}</p>
            <p className={descriptionStyle}>{video.title}</p>
            <p className={descriptionStyle}>{video.friends}</p>
          </div>
        ))
      }
    </div>
  )
}

const videoStyle = css`
  background-color: rgba(0, 0, 0, .05);
  box-shadow: rgba(0, 0, 0, 0.15) 0px 5px 15px 0px;
  `

const containerStyle = css`
  width: 720px;
  margin: 0 auto;
  padding: 40px 20px;
  display: flex;
  align-items: center;
  flex-direction: column;
`

const titleContainerStyle = css`
  display: flex;
  justify-content: flex-start;
  margin: 19px 0px 8px;
`

const videoContainerStyle = css`
  display: flex;
  flex-direction: column;
  margin: 20px 0px 40px;
`

const titleStyle = css`
  margin:  0;
  fontSize: 30px;
`

const descriptionStyle = css`
  margin: 0;
`