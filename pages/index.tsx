import {
  Container,
  Heading,
  Input,
  Link,
  ListItem,
  UnorderedList,
  VStack,
  Tag,
  FormLabel,
  Textarea,
} from '@chakra-ui/react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useEffect, useState } from 'react';
import { useContract } from 'wagmi';
import abi from '../abi.json';
import { TagsInput } from 'react-tag-input-component';

const CONTRACT_ADDRESS = '0x64e52D33C3826828f929fC7Ee00aD17f52844F1F';

export default function Home() {
  const contract = useContract({
    addressOrName: CONTRACT_ADDRESS,
    contractInterface: abi.abi,
  });

  const [eventTime, setEventTime] = useState();

  const [title, setTitle] = useState('');
  const [name, setName] = useState('');
  const [timestamp, setTimestmap] = useState();
  // TODO: create state for img and handle image upload
  const [friends, setFriends] = useState([]);

  return (
    <Container paddingY='10'>
      <ConnectButton />

      <VStack>
        <Heading>Create a new memory</Heading>

        <Input
          placeholder='Title'
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <Input
          placeholder='Your name'
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Input
          type='datetime-local'
          value={timestamp}
          onChange={(e) => setTimestmap(e.target.value)}
        />
        <Input type='file' />

        <FormLabel>Friends</FormLabel>
        <TagsInput
          value={friends}
          onChange={setFriends}
          name='tags'
          placeHolder='tags'
        />

        <Textarea placeholder='a msg' />
      </VStack>
    </Container>
  );
}
