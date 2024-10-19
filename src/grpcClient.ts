import * as grpc from '@grpc/grpc-js';
import { Audio2FaceClient } from '../grpc/audio2face_grpc_pb';
import { AudioRequest, AnimationData } from '../grpc/audio2face_pb';

const client = new Audio2FaceClient('localhost:50051', grpc.credentials.createInsecure());

export function streamAnimationData(audioFilePath: string, onData: (data: AnimationData) => void, onError: (error: Error) => void) {
  const request = new AudioRequest();
  request.setAudioFilePath(audioFilePath);

  const stream = client.streamAnimationData(request);

  stream.on('data', (response: AnimationData) => {
    onData(response);
  });

  stream.on('error', (error: Error) => {
    onError(error);
  });
}
