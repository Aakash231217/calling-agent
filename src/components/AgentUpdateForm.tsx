import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchAgentById, updateAgent, UpdateAgentPayload, AgentPayload } from '../utils/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  language: z.object({
    enabled: z.string(),
    switching: z.boolean(),
    synthesizer: z.object({
      voiceConfig: z.object({
        model: z.enum(['waves', 'waves_lightning_large', 'waves_lightning_large_voice_clone']),
        voiceId: z.string().optional(),
        gender: z.enum(['male', 'female']).optional(),
      }).optional(),
      speed: z.number().min(0.5).max(2).optional(),
      consistency: z.number().min(0).max(1).optional(),
      similarity: z.number().min(0).max(1).optional(),
      enhancement: z.number().optional(),
    }).optional(),
    speed: z.number().min(0.5).max(2).optional(),
    consistency: z.number().min(0).max(1).optional(),
    similarity: z.number().min(0).max(1).optional(),
    enhancement: z.number().optional(),
  }).optional(),
  globalKnowledgeBaseId: z.string().optional(),
  slmModel: z.string().optional(),
  defaultVariables: z.record(z.any()).optional(),
  globalPrompt: z.string().optional(),
  telephonyProductId: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface AgentUpdateFormProps {
  agentId: string;
  onSuccess?: () => void;
}

export const AgentUpdateForm = ({ agentId, onSuccess }: AgentUpdateFormProps) => {
  const [activeTab, setActiveTab] = useState('basic');
  const queryClient = useQueryClient();

  // Fetch agent data
  const { data: agentResponse, isLoading: isLoadingAgent, error: agentError } = useQuery({
    queryKey: ['agent', agentId],
    queryFn: () => fetchAgentById(agentId),
    enabled: !!agentId,
  });

  const agent = agentResponse?.data;

  // Setup form with default values
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      language: {
        enabled: 'en',
        switching: false,
        synthesizer: {
          voiceConfig: {
            model: 'waves_lightning_large',
            voiceId: '',
            gender: 'male',
          },
          speed: 1.0,
          consistency: 0.5,
          similarity: 0,
          enhancement: 1,
        },
        speed: 1.0,
        consistency: 0.5,
        similarity: 0,
        enhancement: 1,
      },
      slmModel: 'electron',
      defaultVariables: {},
    },
  });

  // Update form values when agent data is loaded
  useEffect(() => {
    if (agent) {
      form.reset({
        name: agent.name || '',
        description: agent.description || '',
        language: {
          enabled: agent.language?.enabled || 'en',
          switching: agent.language?.switching || false,
          synthesizer: {
            voiceConfig: {
              model: (agent.language?.synthesizer?.voiceConfig?.model as 'waves' | 'waves_lightning_large' | 'waves_lightning_large_voice_clone') || 'waves_lightning_large',
              voiceId: agent.language?.synthesizer?.voiceConfig?.voiceId || '',
              gender: agent.language?.synthesizer?.voiceConfig?.gender || 'male',
            },
            speed: agent.language?.synthesizer?.speed || 1.0,
            consistency: agent.language?.synthesizer?.consistency || 0.5,
            similarity: agent.language?.synthesizer?.similarity || 0,
            enhancement: agent.language?.synthesizer?.enhancement || 1,
          },
          speed: agent.language?.speed || 1.0,
          consistency: agent.language?.consistency || 0.5,
          similarity: agent.language?.similarity || 0,
          enhancement: agent.language?.enhancement || 1,
        },
        globalKnowledgeBaseId: agent.globalKnowledgeBaseId || '',
        slmModel: agent.slmModel || 'electron',
        defaultVariables: agent.defaultVariables || {},
        globalPrompt: agent.globalPrompt || '',
        telephonyProductId: agent.telephonyProductId || '',
      });
    }
  }, [agent, form]);

  // Mutation for updating the agent
  const updateAgentMutation = useMutation({
    mutationFn: (data: UpdateAgentPayload) => updateAgent(agentId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent', agentId] });
      queryClient.invalidateQueries({ queryKey: ['agents'] });
      if (onSuccess) onSuccess();
    },
  });

  const onSubmit = (data: FormValues) => {
    // Prepare payload according to API requirements
    const payload: UpdateAgentPayload = {};
    
    if (data.name) payload.name = data.name;
    if (data.description) payload.description = data.description;
    
    if (data.language) {
      payload.language = {
        enabled: data.language.enabled,
        switching: data.language.switching
      };
      
      // Add synthesizer under language
      if (data.language.synthesizer) {
        payload.language.synthesizer = {};
        
        if (data.language.synthesizer.voiceConfig) {
          payload.language.synthesizer.voiceConfig = {
            model: data.language.synthesizer.voiceConfig.model
          };
          
          // Add voiceId and gender only if needed
          if (data.language.synthesizer.voiceConfig.voiceId) {
            payload.language.synthesizer.voiceConfig.voiceId = data.language.synthesizer.voiceConfig.voiceId;
          }
          
          if (data.language.synthesizer.voiceConfig.gender) {
            payload.language.synthesizer.voiceConfig.gender = data.language.synthesizer.voiceConfig.gender;
          }
        }
        
        // Add all numeric synthesizer properties if defined
        if (data.language.synthesizer.speed !== undefined) {
          payload.language.synthesizer.speed = data.language.synthesizer.speed;
        }
        
        if (data.language.synthesizer.consistency !== undefined) {
          payload.language.synthesizer.consistency = data.language.synthesizer.consistency;
        }
        
        if (data.language.synthesizer.similarity !== undefined) {
          payload.language.synthesizer.similarity = data.language.synthesizer.similarity;
        }
        
        if (data.language.synthesizer.enhancement !== undefined) {
          payload.language.synthesizer.enhancement = data.language.synthesizer.enhancement;
        }
      }
      
      // Add language-level properties
      if (data.language.speed !== undefined) {
        payload.language.speed = data.language.speed;
      }
      
      if (data.language.consistency !== undefined) {
        payload.language.consistency = data.language.consistency;
      }
      
      if (data.language.similarity !== undefined) {
        payload.language.similarity = data.language.similarity;
      }
      
      if (data.language.enhancement !== undefined) {
        payload.language.enhancement = data.language.enhancement;
      }
    }
    
    if (data.globalKnowledgeBaseId) payload.globalKnowledgeBaseId = data.globalKnowledgeBaseId;
    if (data.slmModel) payload.slmModel = data.slmModel;
    if (data.defaultVariables) payload.defaultVariables = data.defaultVariables;
    if (data.globalPrompt) payload.globalPrompt = data.globalPrompt;
    if (data.telephonyProductId) payload.telephonyProductId = data.telephonyProductId;
    
    console.log('Updating agent with payload:', payload);
    updateAgentMutation.mutate(payload);
  };

  if (isLoadingAgent) {
    return (
      <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Update Agent</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center items-center py-6">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <p className="ml-2 text-gray-600">Loading agent data...</p>
        </CardContent>
      </Card>
    );
  }

  if (agentError) {
    return (
      <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-red-600">Error Loading Agent</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {agentError instanceof Error ? agentError.message : 'Failed to load agent data'}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
      <CardHeader>
        <CardTitle>Update Agent</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="language">Language</TabsTrigger>
                <TabsTrigger value="voice">Voice</TabsTrigger>
                <TabsTrigger value="advanced">Advanced</TabsTrigger>
              </TabsList>
              
              <TabsContent value="basic" className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Agent name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Agent description" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>
              
              <TabsContent value="language" className="space-y-4">
                <FormField
                  control={form.control}
                  name="language.enabled"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Language</FormLabel>
                      <FormControl>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select language" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="en">English</SelectItem>
                            <SelectItem value="hi">Hindi</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="language.switching"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Language Switching</FormLabel>
                        <FormDescription>
                          Enable language switching for this agent
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </TabsContent>
              
              <TabsContent value="voice" className="space-y-4">
                <FormField
                  control={form.control}
                  name="language.synthesizer.voiceConfig.model"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Voice Model</FormLabel>
                      <FormControl>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select voice model" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="waves">Waves</SelectItem>
                            <SelectItem value="waves_lightning_large">Waves Lightning Large</SelectItem>
                            <SelectItem value="waves_lightning_large_voice_clone">Waves Lightning Large Voice Clone</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormDescription>
                        Select the voice synthesis model to use
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {form.watch('language.synthesizer.voiceConfig.model') === 'waves_lightning_large_voice_clone' && (
                  <>
                    <FormField
                      control={form.control}
                      name="language.synthesizer.voiceConfig.voiceId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Voice ID</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter voice ID" {...field} />
                          </FormControl>
                          <FormDescription>
                            Enter the voice ID from your Waves voice clone
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="language.synthesizer.voiceConfig.gender"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Voice Gender</FormLabel>
                          <FormControl>
                            <Select value={field.value} onValueChange={field.onChange}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select gender" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="male">Male</SelectItem>
                                <SelectItem value="female">Female</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}
                
                <FormField
                  control={form.control}
                  name="language.synthesizer.speed"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Speed ({field.value})</FormLabel>
                      <FormControl>
                        <Input 
                          type="range" 
                          min="0.5" 
                          max="2" 
                          step="0.1" 
                          {...field} 
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="language.synthesizer.consistency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Consistency ({field.value})</FormLabel>
                      <FormControl>
                        <Input 
                          type="range" 
                          min="0" 
                          max="1" 
                          step="0.1" 
                          {...field} 
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="language.synthesizer.similarity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Similarity ({field.value})</FormLabel>
                      <FormControl>
                        <Input 
                          type="range" 
                          min="0" 
                          max="1" 
                          step="0.1" 
                          {...field} 
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="language.synthesizer.enhancement"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Enhancement</FormLabel>
                      <FormControl>
                        <Select 
                          value={field.value.toString()} 
                          onValueChange={(value) => field.onChange(parseInt(value))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select enhancement level" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">Level 1</SelectItem>
                            <SelectItem value="2">Level 2</SelectItem>
                            <SelectItem value="3">Level 3</SelectItem>
                            <SelectItem value="4">Level 4</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>
              
              <TabsContent value="advanced" className="space-y-4">
                <FormField
                  control={form.control}
                  name="globalKnowledgeBaseId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Global Knowledge Base ID</FormLabel>
                      <FormControl>
                        <Input placeholder="Knowledge base ID" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="slmModel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SLM Model</FormLabel>
                      <FormControl>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select SLM model" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="electron">Electron</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="globalPrompt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Global Prompt</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Global instructions for the agent" 
                          className="min-h-[100px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Set global instructions for your agent's personality, role, and behavior
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="telephonyProductId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telephony Product ID</FormLabel>
                      <FormControl>
                        <Input placeholder="Telephony product ID" {...field} />
                      </FormControl>
                      <FormDescription>
                        The telephony product ID used for outbound calls
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>
            </Tabs>
            
            <div className="flex justify-end">
              {updateAgentMutation.isSuccess && (
                <Alert className="mb-4 border-green-500 text-green-700">
                  <CheckCircle className="h-4 w-4" />
                  <AlertTitle>Success</AlertTitle>
                  <AlertDescription>
                    Agent updated successfully
                  </AlertDescription>
                </Alert>
              )}
              
              {updateAgentMutation.isError && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>
                    {updateAgentMutation.error instanceof Error 
                      ? updateAgentMutation.error.message 
                      : 'Failed to update agent'}
                  </AlertDescription>
                </Alert>
              )}
              
              <Button 
                type="submit" 
                disabled={updateAgentMutation.isPending}
                className="min-w-[120px]"
              >
                {updateAgentMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Update Agent
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
