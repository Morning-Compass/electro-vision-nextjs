type ImageResponse = {
  file_name: string;
  storage_path: string;
  svg_content: string;
};

export type PythonReponse = {
  detail: string;
  files: ImageResponse[];
};
