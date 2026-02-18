class TemperatureController:
    def __init__(self):
        self.base_temp = 0.7

    def adjust(self, last_divergence: float, complexity_score: int) -> float:
        # Algorithm: Low divergence implies groupthink -> Increase temp
        # High divergence implies chaos -> Decrease temp
        threshold = 5.0 
        
        delta = (threshold - last_divergence) * 0.05
        new_temp = self.base_temp + delta
        
        # Clamp
        return max(0.1, min(1.0, new_temp))

temp_controller = TemperatureController()