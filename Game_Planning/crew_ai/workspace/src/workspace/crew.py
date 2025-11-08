import os
from typing import List

from crewai import Agent, Crew, LLM, Process, Task
from crewai.agents.agent_builder.base_agent import BaseAgent
from crewai.project import CrewBase, agent, crew, task

from workspace.tools import (
    ConnectionMapTool,
    ContextPackTool,
    DocPatchTool,
    EvaluateRiddleTool,
    PhysicalPlanTool,
    PlacementUpdateTool,
    RiddlePromptTool,
    RoadmapNoteTool,
    SequencingAnalyzerTool,
    TestingNoteTool,
    VariationTool,
)


@CrewBase
class Workspace:
    """Workspace crew"""

    agents: List[BaseAgent]
    tasks: List[Task]

    context_tool = ContextPackTool()
    sequencing_tool = SequencingAnalyzerTool()
    prompt_tool = RiddlePromptTool()
    eval_tool = EvaluateRiddleTool()
    variation_tool = VariationTool()
    connection_tool = ConnectionMapTool()
    doc_patch_tool = DocPatchTool()
    roadmap_tool = RoadmapNoteTool()
    placement_tool = PlacementUpdateTool()
    testing_tool = TestingNoteTool()
    physical_plan_tool = PhysicalPlanTool()

    def _build_llm(self, model_env: str, default_model: str, temperature: float) -> LLM:
        model_id = os.getenv(model_env, default_model)
        base_url = os.getenv("OPENAI_API_BASE", "https://openrouter.ai/api/v1")
        api_key = os.getenv("OPENAI_API_KEY")
        return LLM(
            model=model_id,
            base_url=base_url,
            api_key=api_key,
            temperature=temperature,
        )

    @agent
    def context_curator(self) -> Agent:
        llm = self._build_llm(
            "CONTEXT_LLM_MODEL",
            "openai/gpt-4o-mini",
            temperature=0.15,
        )
        return Agent(
            config=self.agents_config["context_curator"],  # type: ignore[index]
            tools=[self.context_tool],
            llm=llm,
            verbose=True,
        )

    @agent
    def riddle_reviewer(self) -> Agent:
        llm = self._build_llm(
            "CRITIC_LLM_MODEL",
            "openai/gpt-4o",
            temperature=0.1,
        )
        return Agent(
            config=self.agents_config["riddle_reviewer"],  # type: ignore[index]
            tools=[self.eval_tool, self.variation_tool],
            llm=llm,
            verbose=True,
        )

    @agent
    def experience_architect(self) -> Agent:
        llm = self._build_llm(
            "CREATIVE_BRIEF_MODEL",
            "openai/gpt-4o",
            temperature=0.2,
        )
        return Agent(
            config=self.agents_config["experience_architect"],  # type: ignore[index]
            tools=[self.context_tool, self.connection_tool],
            llm=llm,
            verbose=True,
        )

    @agent
    def riddle_ideator(self) -> Agent:
        llm = self._build_llm(
            "RIDDLE_IDEATOR_MODEL",
            "openai/gpt-4o",
            temperature=0.3,
        )
        return Agent(
            config=self.agents_config["riddle_ideator"],  # type: ignore[index]
            tools=[self.prompt_tool, self.context_tool],
            llm=llm,
            verbose=True,
        )

    @agent
    def riddle_critic(self) -> Agent:
        llm = self._build_llm(
            "RIDDLE_CRITIC_MODEL",
            "openai/gpt-4o",
            temperature=0.1,
        )
        return Agent(
            config=self.agents_config["riddle_critic"],  # type: ignore[index]
            tools=[self.eval_tool, self.connection_tool],
            llm=llm,
            verbose=True,
        )

    @agent
    def hint_specialist(self) -> Agent:
        llm = self._build_llm(
            "HINT_SPECIALIST_MODEL",
            "openai/gpt-4o-mini",
            temperature=0.2,
        )
        return Agent(
            config=self.agents_config["hint_specialist"],  # type: ignore[index]
            tools=[self.context_tool],
            llm=llm,
            verbose=True,
        )

    @agent
    def connection_mapper(self) -> Agent:
        llm = self._build_llm(
            "CONNECTION_MAPPER_MODEL",
            "openai/gpt-4o-mini",
            temperature=0.15,
        )
        return Agent(
            config=self.agents_config["connection_mapper"],  # type: ignore[index]
            tools=[self.connection_tool],
            llm=llm,
            verbose=True,
        )

    @agent
    def sequence_planner(self) -> Agent:
        llm = self._build_llm(
            "SEQUENCE_PLANNER_MODEL",
            "openai/gpt-4o",
            temperature=0.2,
        )
        return Agent(
            config=self.agents_config["sequence_planner"],  # type: ignore[index]
            tools=[self.context_tool, self.sequencing_tool, self.connection_tool, self.roadmap_tool],
            llm=llm,
            verbose=True,
        )

    @agent
    def production_ops(self) -> Agent:
        llm = self._build_llm(
            "PRODUCTION_OPS_MODEL",
            "openai/gpt-4o-mini",
            temperature=0.15,
        )
        return Agent(
            config=self.agents_config["production_ops"],  # type: ignore[index]
            tools=[
                self.physical_plan_tool,
                self.placement_tool,
                self.testing_tool,
                self.doc_patch_tool,
                self.roadmap_tool,
            ],
            llm=llm,
            verbose=True,
        )

    @agent
    def revision_scribe(self) -> Agent:
        llm = self._build_llm(
            "REVISION_SCRIBE_MODEL",
            "openai/gpt-4o",
            temperature=0.1,
        )
        return Agent(
            config=self.agents_config["revision_scribe"],  # type: ignore[index]
            tools=[self.eval_tool, self.variation_tool],
            llm=llm,
            verbose=True,
        )

    @agent
    def flow_integrator(self) -> Agent:
        llm = self._build_llm(
            "FLOW_INTEGRATOR_MODEL",
            "openai/gpt-4o-mini",
            temperature=0.1,
        )
        return Agent(
            config=self.agents_config["flow_integrator"],  # type: ignore[index]
            tools=[
                self.connection_tool,
                self.doc_patch_tool,
                self.roadmap_tool,
                self.placement_tool,
                self.testing_tool,
            ],
            llm=llm,
            verbose=True,
        )

    @task
    def context_gathering_task(self) -> Task:
        return Task(
            config=self.tasks_config["context_gathering_task"],  # type: ignore[index]
        )

    @task
    def evaluation_task(self) -> Task:
        return Task(
            config=self.tasks_config["evaluation_task"],  # type: ignore[index]
        )

    @task
    def creative_brief_task(self) -> Task:
        return Task(
            config=self.tasks_config["creative_brief_task"],  # type: ignore[index]
            output_file="crew_outputs/creative_brief.md",
        )

    @task
    def riddle_draft_task(self) -> Task:
        return Task(
            config=self.tasks_config["riddle_draft_task"],  # type: ignore[index]
            output_file="crew_outputs/riddle_draft.md",
        )

    @task
    def critique_assessment_task(self) -> Task:
        return Task(
            config=self.tasks_config["critique_assessment_task"],  # type: ignore[index]
            output_file="crew_outputs/critique_memo.md",
        )

    @task
    def hint_review_task(self) -> Task:
        return Task(
            config=self.tasks_config["hint_review_task"],  # type: ignore[index]
            output_file="crew_outputs/hint_review.md",
        )

    @task
    def connection_review_task(self) -> Task:
        return Task(
            config=self.tasks_config["connection_review_task"],  # type: ignore[index]
            output_file="crew_outputs/connection_report.md",
        )

    @task
    def hint_audit_task(self) -> Task:
        return Task(
            config=self.tasks_config["hint_audit_task"],  # type: ignore[index]
            output_file="crew_outputs/hint_audit.md",
        )

    @task
    def hint_fix_task(self) -> Task:
        return Task(
            config=self.tasks_config["hint_fix_task"],  # type: ignore[index]
            output_file="crew_outputs/hint_fixes.md",
        )

    @task
    def revision_plan_task(self) -> Task:
        return Task(
            config=self.tasks_config["revision_plan_task"],  # type: ignore[index]
            output_file="crew_outputs/revision_plan.md",
        )

    @task
    def apply_revision_task(self) -> Task:
        return Task(
            config=self.tasks_config["apply_revision_task"],  # type: ignore[index]
            output_file="crew_outputs/revised_riddle.md",
        )

    @task
    def flow_sync_task(self) -> Task:
        return Task(
            config=self.tasks_config["flow_sync_task"],  # type: ignore[index]
            output_file="crew_outputs/flow_integration.md",
        )

    @task
    def arc_analysis_task(self) -> Task:
        return Task(
            config=self.tasks_config["arc_analysis_task"],  # type: ignore[index]
            output_file="crew_outputs/arc_analysis.md",
        )

    @task
    def arc_update_task(self) -> Task:
        return Task(
            config=self.tasks_config["arc_update_task"],  # type: ignore[index]
            output_file="crew_outputs/arc_update_plan.md",
        )

    @task
    def physical_sync_task(self) -> Task:
        return Task(
            config=self.tasks_config["physical_sync_task"],  # type: ignore[index]
            output_file="crew_outputs/physical_sync.md",
        )

    @task
    def testing_sync_task(self) -> Task:
        return Task(
            config=self.tasks_config["testing_sync_task"],  # type: ignore[index]
            output_file="crew_outputs/testing_sync.md",
        )

    @crew
    def crew(self) -> Crew:
        """Creates the Workspace crew"""

        return Crew(
            agents=self.agents,
            tasks=self.tasks,
            process=Process.sequential,
            verbose=True,
        )

    def creative_studio(self) -> Crew:
        return Crew(
            agents=[
                self.context_curator(),
                self.experience_architect(),
                self.riddle_ideator(),
            ],
            tasks=[
                self.context_gathering_task(),
                self.creative_brief_task(),
                self.riddle_draft_task(),
            ],
            process=Process.sequential,
            verbose=True,
        )

    def critique_council(self) -> Crew:
        return Crew(
            agents=[
                self.riddle_critic(),
                self.riddle_reviewer(),
                self.hint_specialist(),
                self.connection_mapper(),
            ],
            tasks=[
                self.critique_assessment_task(),
                self.evaluation_task(),
                self.hint_review_task(),
                self.connection_review_task(),
            ],
            process=Process.sequential,
            verbose=True,
        )

    def revision_crew(self) -> Crew:
        return Crew(
            agents=[self.revision_scribe()],
            tasks=[self.revision_plan_task(), self.apply_revision_task()],
            process=Process.sequential,
            verbose=True,
        )

    def integration_crew(self) -> Crew:
        return Crew(
            agents=[self.flow_integrator()],
            tasks=[self.flow_sync_task()],
            process=Process.sequential,
            verbose=True,
        )

    def hint_audit_crew(self) -> Crew:
        return Crew(
            agents=[self.hint_specialist()],
            tasks=[self.hint_audit_task(), self.hint_fix_task()],
            process=Process.sequential,
            verbose=True,
        )
