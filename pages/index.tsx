//@ts-nocheck

import {
  Container,
  Heading,
  Input,
  VStack,
  FormLabel,
  Textarea,
  Button,
  Image,
} from "@chakra-ui/react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useContract } from "wagmi";
import abi from "../abi.json";
import { TagsInput } from "react-tag-input-component";
import { WebBundlr } from "@bundlr-network/client";
import { MainContext } from "../context";
import { useState, useRef } from "react";
import { providers, utils } from "ethers";
import { css } from "@emotion/css";
import Link from "next/link";

const CONTRACT_ADDRESS = "0x64e52D33C3826828f929fC7Ee00aD17f52844F1F";

export default function Home({ Component, pageProps }) { 

  return (
    <div></div>
  );
}
