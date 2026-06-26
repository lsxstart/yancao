import { useState } from "react";
import type { DiseaseCase, Plot } from "@yancao/domain";

interface DiseaseShowcaseProps {
  diseaseCases: DiseaseCase[];
  preferredCase?: DiseaseCase;
  plot?: Plot | null;
}

interface TobaccoVirusCase {
  id: string;
  name: string;
  shortName: string;
  imageUrl: string;
  riskLevel: number;
  summary: string;
  prevention: string;
}

const tobaccoVirusCases: TobaccoVirusCase[] = [
  {
    id: "tmv",
    name: "烟草花叶病毒病",
    shortName: "TMV",
    imageUrl: "/kb/tmv/1105a6418852b20b59c0c74d7bd6327d.jpg",
    riskLevel: 4,
    summary: "由烟草花叶病毒引起，主要通过带毒种苗、病株汁液、人员和农具接触传播。病叶常出现黄绿相间的花叶、皱缩和畸形，严重时植株生长受阻。",
    prevention: "使用健康种苗，及时清除病株和田间残体，避免接触烟株前吸烟或接触烟草制品，并做好手部、农具和机械消毒。田间作业应先健康区、后发病区，重点减少机械传播。"
  },
  {
    id: "cmv",
    name: "烟草黄瓜花叶病毒病",
    shortName: "CMV",
    imageUrl: "/kb/cmv/0af563fbce1ec7c43e9a9caa536ca17d.png",
    riskLevel: 4,
    summary: "由黄瓜花叶病毒引起，主要通过蚜虫传播。病株叶片常出现黄绿花叶、皱缩和畸形，严重时叶片变窄、植株矮化。",
    prevention: "选用健康种苗，及时清除杂草和病株，加强蚜虫监测，保持工具清洁，减少病株汁液接触健康烟株。药剂应严格按照登记标签使用，防控重点是提前预防和控制传播。"
  },
  {
    id: "pvy",
    name: "烟草马铃薯Y病毒病",
    shortName: "PVY",
    imageUrl: "/kb/pvy/f31c1ac138aace1d408cb3887f51c781.png",
    riskLevel: 3,
    summary: "由马铃薯Y病毒引起，主要通过蚜虫及病株汁液传播。病株可出现花叶、叶脉褪绿、坏死斑、叶片畸形和植株矮化。",
    prevention: "使用健康种苗，清除病株及茄科杂草，避免与马铃薯、辣椒、番茄等寄主作物相邻种植。加强蚜虫监测和工具消毒，减少病毒在田间传播。"
  },
  {
    id: "tswv",
    name: "烟草番茄斑萎病毒病",
    shortName: "TSWV",
    imageUrl: "/kb/tswv/a70c57c711962bbf8e28e9044526cd5e.png",
    riskLevel: 5,
    summary: "由番茄斑萎病毒引起，主要通过蓟马传播。病株常出现叶片黄斑、褐色坏死斑、叶脉褐变和植株矮化，严重时可能整株死亡。",
    prevention: "使用无病毒、无蓟马种苗，清除烟田周边杂草和病株，加强苗床及移栽初期的蓟马监测。结合防虫网和登记药剂控制蓟马，重点做好早期预防。"
  }
];

export function DiseaseShowcase({}: DiseaseShowcaseProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const diseaseCase = tobaccoVirusCases[activeIndex];

  const goNext = () => {
    setActiveIndex((index) => (index + 1) % tobaccoVirusCases.length);
  };

  const goPrevious = () => {
    setActiveIndex((index) => (index - 1 + tobaccoVirusCases.length) % tobaccoVirusCases.length);
  };

  return (
    <div className="disease-showcase">
      <div className="disease-image-frame">
        <img src={diseaseCase.imageUrl} alt={diseaseCase.name} />
      </div>

      <div className="disease-copy">
        <div className="disease-copy-head">
          <div>
            <h3>
              {diseaseCase.name}
              <span>{diseaseCase.shortName}</span>
            </h3>
          </div>
          <b>{activeIndex + 1}/{tobaccoVirusCases.length}</b>
        </div>

        <div className="disease-risk">
          <span>风险等级</span>
          <div aria-label={`风险等级 ${diseaseCase.riskLevel}`}>
            {Array.from({ length: 5 }).map((_, index) => (
              <i className={index < diseaseCase.riskLevel ? "active" : ""} key={index} />
            ))}
            <b>{diseaseCase.riskLevel}</b>
          </div>
        </div>

        <section>
          <strong>病害简述</strong>
          <p>{diseaseCase.summary}</p>
        </section>

        <section>
          <strong>防治建议</strong>
          <p>{diseaseCase.prevention}</p>
        </section>

      </div>

      <button className="carousel-arrow carousel-prev" onClick={goPrevious} type="button" aria-label="上一张">
        ‹
      </button>
      <button className="carousel-arrow carousel-next" onClick={goNext} type="button" aria-label="下一张">
        ›
      </button>
    </div>
  );
}
