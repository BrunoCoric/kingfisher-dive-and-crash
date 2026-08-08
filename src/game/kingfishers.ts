import common from "../assets/kingfishers/common-kingfisher.png";
import pied from "../assets/kingfishers/pied-kingfisher.png";
import orientalDwarf from "../assets/kingfishers/oriental-dwarf-kingfisher.png";
import belted from "../assets/kingfishers/belted-kingfisher.png";
import azure from "../assets/kingfishers/azure-kingfisher.png";
import yellowBilled from "../assets/kingfishers/yellow-billed-kingfisher.png";
import banded from "../assets/kingfishers/banded-kingfisher.png";
import green from "../assets/kingfishers/green-kingfisher.png";

export type KingfisherID =
  | "common"
  | "pied"
  | "orientalDwarf"
  | "belted"
  | "azure"
  | "yellowBilled"
  | "banded"
  | "green";

export interface Kingfisher {
  id: KingfisherID;
  displayName: string;
  sprite: string;
  facing: "left" | "right";
  accent: string;
}

export const KINGFISHERS: Record<KingfisherID, Kingfisher> = {
  common: {
    id: "common",
    displayName: "Common Kingfisher",
    sprite: common,
    facing: "right",
    accent: "#2B5FBF",
  },
  pied: {
    id: "pied",
    displayName: "Pied Kingfisher",
    sprite: pied,
    facing: "left",
    accent: "#3A3A3A",
  },
  orientalDwarf: {
    id: "orientalDwarf",
    displayName: "Oriental Dwarf Kingfisher",
    sprite: orientalDwarf,
    facing: "left",
    accent: "#E8732A",
  },
  belted: {
    id: "belted",
    displayName: "Belted Kingfisher",
    sprite: belted,
    facing: "left",
    accent: "#1FA08C",
  },
  azure: {
    id: "azure",
    displayName: "Azure Kingfisher",
    sprite: azure,
    facing: "left",
    accent: "#2E9FD6",
  },
  yellowBilled: {
    id: "yellowBilled",
    displayName: "Yellow-billed Kingfisher",
    sprite: yellowBilled,
    facing: "left",
    accent: "#6B8A2E",
  },
  banded: {
    id: "banded",
    displayName: "Banded Kingfisher",
    sprite: banded,
    facing: "left",
    accent: "#B54A2E",
  },
  green: {
    id: "green",
    displayName: "Green Kingfisher",
    sprite: green,
    facing: "left",
    accent: "#1F8A52",
  },
};