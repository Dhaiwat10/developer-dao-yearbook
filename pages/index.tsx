import {
  Container,
  Heading,
  Input,
  VStack,
  FormLabel,
  Textarea,
  Button,
  Image,
} from '@chakra-ui/react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useState } from 'react';
import { useContract } from 'wagmi';
import abi from '../abi.json';
import { TagsInput } from 'react-tag-input-component';

const CONTRACT_ADDRESS = '0x64e52D33C3826828f929fC7Ee00aD17f52844F1F';

export default function Home() {
  const contract = useContract({
    addressOrName: CONTRACT_ADDRESS,
    contractInterface: abi.abi,
  });

  const [title, setTitle] = useState('');
  const [name, setName] = useState('');
  const [timestamp, setTimestmap] = useState('');
  // TODO: create state for img and handle image upload
  const [friends, setFriends] = useState([]);

  const [image, setImage] = useState('');
  const [createObjectURL, setCreateObjectURL] = useState('');

  const [message, setMessage] = useState('');

  const uploadToClient = (event) => {
    if (event.target.files && event.target.files[0]) {
      const i = event.target.files[0];

      setImage(i);
      setCreateObjectURL(URL.createObjectURL(i));
    }
  };

  const uploadToServer = async (event) => {
    const body = new FormData();
    body.append('file', image);
    const response = await fetch('/api/file', {
      method: 'POST',
      body,
    });
  };

  return (
    <Container paddingY='10'>
      <ConnectButton />

      <VStack marginTop='10'>
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

        {image && <Image src={createObjectURL} height='200px' rounded='lg' />}

        <Input type='file' onChange={uploadToClient} />
        
        <TagsInput
          value={friends}
          onChange={setFriends}
          name='tags'
          placeHolder="enter your friends' addresses here"
        />

        <Textarea
          placeholder='a msg'
          onChange={(e) => setMessage(e.target.value)}
          value={message}
        />

        <Button type='submit' onClick={uploadToServer}>
          Submit
        </Button>
      </VStack>
    </Container>
  );
}
