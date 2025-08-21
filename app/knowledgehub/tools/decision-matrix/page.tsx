"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertCircle, Calculator, HelpCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import KnowledgeHubNavbar from "../../components/KnowledgeHubNavbar"
import KnowledgeHubFooter from "../../components/KnowledgeHubFooter"

// Define types
interface ScoringGuide {
  [key: number]: string;
}

interface Criterion {
  id: string;
  name: string;
  weight: number;
  description: string;
  scoringGuide: ScoringGuide;
}

interface Business {
  name: string;
  scores: { [key: string]: number };
}

// Define the criteria with weights and scoring guides
const criteria: Criterion[] = [
  {
    id: "marketDemand",
    name: "Market Demand",
    weight: 25,
    description: "How strong and accessible is the market for this product?",
    scoringGuide: {
      1: "Very weak demand, limited market access",
      3: "Moderate demand with some market challenges",
      5: "Strong demand with excellent market access",
    },
  },
  {
    id: "startupCost",
    name: "Startup Cost",
    weight: 20,
    description: "How capital-intensive is it to start? (Higher score = Lower cost)",
    scoringGuide: {
      1: "Very High Capital (> GHS 200,000)",
      3: "Moderate Capital (GHS 50,000 - 200,000)",
      5: "Very Low Capital (< GHS 50,000)",
    },
  },
  {
    id: "scalability",
    name: "Scalability",
    weight: 20,
    description: "What is the potential for growth and expansion?",
    scoringGuide: {
      1: "Limited growth potential, local market only",
      3: "Moderate growth potential, regional expansion possible",
      5: "High growth potential, national/export opportunities",
    },
  },
  {
    id: "valueChainGaps",
    name: "Value Chain Gaps",
    weight: 15,
    description: "How well does this solve critical problems in Ghana's food system?",
    scoringGuide: {
      1: "Addresses minor gaps, limited impact",
      3: "Addresses moderate gaps, some system improvement",
      5: "Addresses critical gaps, significant system impact",
    },
  },
  {
    id: "techAdoption",
    name: "Technology Adoption",
    weight: 10,
    description: "Can modern technology create a competitive advantage?",
    scoringGuide: {
      1: "Limited technology application potential",
      3: "Moderate technology integration opportunities",
      5: "High technology adoption potential for competitive advantage",
    },
  },
  {
    id: "personalSkills",
    name: "Personal Skills & Passion",
    weight: 10,
    description: "How well does this align with your skills and interests?",
    scoringGuide: {
      1: "Poor alignment with skills and interests",
      3: "Moderate alignment, some learning required",
      5: "Excellent alignment with existing skills and passion",
    },
  },
]

// Example businesses for demonstration
const exampleBusinesses: Business[] = [
  {
    name: "Mushroom Farming",
    scores: { marketDemand: 4, startupCost: 4, scalability: 3, valueChainGaps: 3, techAdoption: 2, personalSkills: 3 },
  },
  {
    name: "Cassava Processing (Industrial Starch)",
    scores: { marketDemand: 5, startupCost: 2, scalability: 5, valueChainGaps: 5, techAdoption: 4, personalSkills: 2 },
  },
  {
    name: "Greenhouse Vegetables (Tomatoes)",
    scores: { marketDemand: 4, startupCost: 3, scalability: 4, valueChainGaps: 4, techAdoption: 5, personalSkills: 3 },
  },
]

export default function AgribusinessMatrix() {
  const [businesses, setBusinesses] = useState<Business[]>([
    { name: "", scores: {} },
    { name: "", scores: {} },
    { name: "", scores: {} },
  ])
  const [showExample, setShowExample] = useState(false)

  const calculateWeightedScore = (scores: { [key: string]: number }) => {
    return criteria.reduce((total, criterion) => {
      const score = scores[criterion.id] || 0
      return total + (score * criterion.weight) / 100
    }, 0)
  }

  const updateBusinessName = (index: number, name: string) => {
    const updated = [...businesses]
    updated[index].name = name
    setBusinesses(updated)
  }

  const updateScore = (businessIndex: number, criterionId: string, score: number) => {
    const updated = [...businesses]
    updated[businessIndex].scores[criterionId] = score
    setBusinesses(updated)
  }

  const loadExample = () => {
    setBusinesses(
      exampleBusinesses.map((business) => ({
        name: business.name,
        scores: { ...business.scores },
      })),
    )
    setShowExample(true)
  }

  const clearAll = () => {
    setBusinesses([
      { name: "", scores: {} },
      { name: "", scores: {} },
      { name: "", scores: {} },
    ])
    setShowExample(false)
  }

  const displayBusinesses = showExample ? exampleBusinesses : businesses

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <KnowledgeHubNavbar />
      <main className="flex-1">
        <div className="bg-gradient-to-br from-green-50 to-emerald-100 p-4">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="text-center space-y-4">
              <h1 className="text-4xl font-bold text-green-800">Ghana Agribusiness Decision Matrix</h1>
              <p className="text-lg text-green-700 max-w-3xl mx-auto">
                Make evidence-based decisions for your agribusiness venture in Ghana. Evaluate opportunities across key
                criteria to find the best fit for your goals.
              </p>
            </div>

            <Tabs defaultValue="matrix" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="matrix" className="flex items-center gap-2">
                  <Calculator className="w-4 h-4" />
                  Decision Matrix
                </TabsTrigger>
                <TabsTrigger value="guide" className="flex items-center gap-2">
                  <HelpCircle className="w-4 h-4" />
                  Scoring Guide
                </TabsTrigger>
                <TabsTrigger value="instructions" className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  How to Use
                </TabsTrigger>
              </TabsList>

              <TabsContent value="matrix" className="space-y-6">
                {/* Controls */}
                <Card>
                  <CardHeader>
                    <CardTitle>Get Started</CardTitle>
                    <CardDescription>Load an example or start fresh with your own agribusiness ideas</CardDescription>
                  </CardHeader>
                  <CardContent className="flex gap-4">
                    <Button onClick={loadExample} variant="outline">
                      Load Example
                    </Button>
                    <Button onClick={clearAll} variant="outline">
                      Start Fresh
                    </Button>
                  </CardContent>
                </Card>

                {/* Business Names Input */}
                {!showExample && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Your Agribusiness Ideas</CardTitle>
                      <CardDescription>Enter up to 3 agribusiness ideas you want to evaluate</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {businesses.map((business, index) => (
                        <div key={index} className="space-y-2">
                          <Label htmlFor={`business-${index}`}>Business Idea {index + 1}</Label>
                          <Input
                            id={`business-${index}`}
                            placeholder={`Enter business idea ${index + 1}`}
                            value={business.name}
                            onChange={(e) => updateBusinessName(index, e.target.value)}
                          />
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {/* Decision Matrix */}
                <Card>
                  <CardHeader>
                    <CardTitle>Decision Matrix</CardTitle>
                    <CardDescription>Score each business idea from 1-5 for each criterion</CardDescription>
                  </CardHeader>
                  <CardContent className="overflow-x-auto">
                    <div className="min-w-[800px]">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="border-b-2 border-green-200">
                            <th className="text-left p-3 font-semibold">Criterion</th>
                            <th className="text-center p-3 font-semibold">Weight</th>
                            {displayBusinesses.map((business, index) => (
                              <th key={index} className="text-center p-3 font-semibold min-w-[150px]">
                                {business.name || `Business ${index + 1}`}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {criteria.map((criterion) => (
                            <tr key={criterion.id} className="border-b border-green-100 hover:bg-green-50">
                              <td className="p-3">
                                <div>
                                  <div className="font-medium">{criterion.name}</div>
                                  <div className="text-sm text-muted-foreground">{criterion.description}</div>
                                </div>
                              </td>
                              <td className="text-center p-3">
                                <Badge variant="secondary">{criterion.weight}%</Badge>
                              </td>
                              {displayBusinesses.map((business, businessIndex) => (
                                <td key={businessIndex} className="text-center p-3">
                                  {showExample ? (
                                    <Badge variant="outline" className="text-lg px-3 py-1">
                                      {business.scores[criterion.id]}
                                    </Badge>
                                  ) : (
                                    <div className="flex gap-1 justify-center">
                                      {[1, 2, 3, 4, 5].map((score) => (
                                        <button
                                          key={score}
                                          onClick={() => updateScore(businessIndex, criterion.id, score)}
                                          className={`w-8 h-8 rounded text-sm font-medium transition-colors ${
                                            business.scores[criterion.id] === score
                                              ? "bg-green-600 text-white"
                                              : "bg-gray-200 hover:bg-gray-300"
                                          }`}
                                        >
                                          {score}
                                        </button>
                                      ))}
                                    </div>
                                  )}
                                </td>
                              ))}
                            </tr>
                          ))}
                          <tr className="border-t-2 border-green-200 bg-green-50 font-semibold">
                            <td className="p-3">Total Weighted Score</td>
                            <td className="text-center p-3">100%</td>
                            {displayBusinesses.map((business, index) => (
                              <td key={index} className="text-center p-3">
                                <Badge variant="default" className="text-lg px-3 py-1">
                                  {calculateWeightedScore(business.scores).toFixed(1)}
                                </Badge>
                              </td>
                            ))}
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>

                {/* Results Summary */}
                {(showExample || businesses.some((b) => b.name && Object.keys(b.scores).length > 0)) && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Results Summary</CardTitle>
                      <CardDescription>Ranked by total weighted score</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {displayBusinesses
                          .map((business, index) => ({
                            ...business,
                            index,
                            totalScore: calculateWeightedScore(business.scores),
                          }))
                          .filter((business) => business.name)
                          .sort((a, b) => b.totalScore - a.totalScore)
                          .map((business, rank) => (
                            <div
                              key={business.index}
                              className={`flex items-center justify-between p-4 rounded-lg border-2 ${
                                rank === 0 ? "border-green-500 bg-green-50" : "border-gray-200"
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <Badge variant={rank === 0 ? "default" : "secondary"}>#{rank + 1}</Badge>
                                <span className="font-semibold">{business.name}</span>
                              </div>
                              <Badge variant="outline" className="text-lg px-3 py-1">
                                {business.totalScore.toFixed(1)}
                              </Badge>
                            </div>
                          ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="guide" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Scoring Guide</CardTitle>
                    <CardDescription>Detailed rubric for each criterion in the Ghanaian context</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {criteria.map((criterion) => (
                      <div key={criterion.id} className="space-y-3">
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-semibold">{criterion.name}</h3>
                          <Badge variant="secondary">{criterion.weight}% weight</Badge>
                        </div>
                        <p className="text-muted-foreground">{criterion.description}</p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          {[1, 3, 5].map((score) => (
                            <div key={score} className="p-3 border rounded-lg">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant="outline">Score {score}</Badge>
                              </div>
                              <p className="text-sm">{criterion.scoringGuide[score]}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="instructions" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>How to Use This Tool</CardTitle>
                    <CardDescription>Step-by-step guide to evaluate your agribusiness ideas</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        This tool helps you make evidence-based decisions by systematically evaluating different
                        agribusiness opportunities against key success factors.
                      </AlertDescription>
                    </Alert>

                    <div className="space-y-4">
                      <div className="flex gap-3">
                        <Badge variant="outline" className="mt-1">
                          1
                        </Badge>
                        <div>
                          <h4 className="font-semibold">Define Your Options</h4>
                          <p className="text-sm text-muted-foreground">
                            Enter up to 3 agribusiness ideas you&apos;re considering. Be specific (e.g., &quot;Organic Vegetable
                            Farming&quot; rather than just &quot;Farming&quot;).
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <Badge variant="outline" className="mt-1">
                          2
                        </Badge>
                        <div>
                          <h4 className="font-semibold">Score Each Criterion</h4>
                          <p className="text-sm text-muted-foreground">
                            For each business idea, assign a score from 1-5 for each criterion. Use the Scoring Guide tab
                            for detailed rubrics.
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <Badge variant="outline" className="mt-1">
                          3
                        </Badge>
                        <div>
                          <h4 className="font-semibold">Review Weighted Results</h4>
                          <p className="text-sm text-muted-foreground">
                            The tool automatically calculates weighted scores. Higher weights mean more important criteria
                            (Market Demand is weighted highest at 25%).
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <Badge variant="outline" className="mt-1">
                          4
                        </Badge>
                        <div>
                          <h4 className="font-semibold">Make Your Decision</h4>
                          <p className="text-sm text-muted-foreground">
                            The highest-scoring option provides the best balance across all criteria. Consider both the
                            total score and individual criterion scores.
                          </p>
                        </div>
                      </div>
                    </div>

                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Pro Tip:</strong> Start with the example to see how the tool works, then clear it and input
                        your own ideas. Consider your personal circumstances and local market conditions when scoring.
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
      <KnowledgeHubFooter />
    </div>
  )
}
