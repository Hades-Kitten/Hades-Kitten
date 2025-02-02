import { parseStringPromise } from "xml2js";

export default async function xmlToJson<JSON>(
  xml: string,
): Promise<JSON | null> {
  try {
    return (await parseStringPromise(xml, { explicitArray: false })) as JSON;
  } catch (error) {
    console.error("Error converting XML to JSON:", error);
    return null;
  }
}
